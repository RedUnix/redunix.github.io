import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const apiType = url.searchParams.get('type');
  const param = url.searchParams.get('param'); // Optional parameter for future use

  if (!apiType) {
    return new Response(JSON.stringify({ error: 'Missing type parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let responseData: any;
    let targetUrl = '';

    switch (apiType) {
      case 'uselessfact':
        targetUrl = 'https://uselessfacts.jsph.pl/random.json?language=en';
        const uselessResponse = await fetch(targetUrl);
        if (!uselessResponse.ok) throw new Error('Failed to fetch useless fact');
        responseData = await uselessResponse.json();
        return new Response(JSON.stringify({ content: responseData.text || 'No fact available' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      case 'dogfact':
        targetUrl = 'https://dogapi.dog/api/v2/facts?limit=1';
        const dogResponse = await fetch(targetUrl);
        if (!dogResponse.ok) throw new Error('Failed to fetch dog fact');
        responseData = await dogResponse.json();
        // Dog API returns { data: [{ attributes: { body: "fact text" } }] }
        let fact = '';
        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          fact = responseData.data[0].attributes?.body || responseData.data[0].body || 'No fact available';
        }
        return new Response(JSON.stringify({ content: fact || 'No fact available' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      case 'geekjoke':
        targetUrl = 'https://geek-jokes.sameerkumar.website/api?format=json';
        const jokeResponse = await fetch(targetUrl);
        if (!jokeResponse.ok) throw new Error('Failed to fetch joke');
        responseData = await jokeResponse.json();
        return new Response(JSON.stringify({ content: responseData.joke || 'No joke available' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid API type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

