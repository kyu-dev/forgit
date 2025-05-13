import fetch from 'node-fetch';

export const fetchGitHubContributions = async (username, token) => {
  const query = `
    {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  console.log(JSON.stringify(data));
};

fetchGitHubContributions(username, token);
export default fetchGitHubContributions;
