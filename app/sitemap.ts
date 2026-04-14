import { MetadataRoute } from 'next'
import { api } from '@/lib/api'

const BASE_URL = 'https://bscca.bandhannova.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/matches',
    '/teams',
    '/players',
    '/stats',
    '/highlights',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Fetch dynamic content
    const [teams, players, matches] = await Promise.all([
      api.getTeams(),
      api.getPlayers(),
      api.getMatches(),
    ])

    const teamRoutes = (teams || []).map((team: any) => ({
      url: `${BASE_URL}/teams/${team.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const playerRoutes = (players || []).map((player: any) => {
        const teamSlug = teams.find((t: any) => t.id === player.team_id)?.slug || 'freeagent';
        return {
            url: `${BASE_URL}/players/${teamSlug}/${player.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        };
    })

    const matchRoutes = (matches || []).map((match: any) => ({
      url: `${BASE_URL}/matches/${match.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...staticRoutes, ...teamRoutes, ...playerRoutes, ...matchRoutes]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return staticRoutes
  }
}
