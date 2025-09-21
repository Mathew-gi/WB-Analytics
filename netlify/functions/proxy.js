export async function handler(event, context) {
    try {
      const url = `http://109.73.206.144:6969${event.queryStringParameters.path || "/api/incomes"}`;
  
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" }
      });
  
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }
  