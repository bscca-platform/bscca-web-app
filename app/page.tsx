"use client";

import Hero from "@/components/home/Hero";
import TournamentBanner from "@/components/home/TournamentBanner";
import LiveMatch from "@/components/home/LiveMatch";
import TeamsScroll from "@/components/home/TeamsScroll";
import MatchesScroll from "@/components/home/MatchesScroll";
import HighlightsScroll from "@/components/home/HighlightsScroll";
import TopPlayersScroll from "@/components/home/TopPlayersScroll";
import LastMatchOverview from "@/components/home/LastMatchOverview";
import PointsTable from "@/components/home/PointsTable";
import NewsSection from "@/components/home/NewsSection";
import { usePlayers } from "@/hooks/usePlayers";
import { useTeams } from "@/hooks/useTeams";
import { useMatches } from "@/hooks/useMatches";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { LAST_MATCH, HIGHLIGHTS } from "@/lib/data";

export default function Home() {
  const { players, loading: playersLoading } = usePlayers();
  const { teams, loading: teamsLoading } = useTeams();
  const { matches, loading: matchesLoading } = useMatches();
  const { data: liveData, loading: liveLoading } = useLiveMatch();

  // Derive data from Supabase
  const upcomingMatches = matches
    .filter((m: any) => m.status === "upcoming")
    .map((m: any) => ({
      slug: m.slug,
      t1: m.t1 || m.team1?.name || "TBD",
      t2: m.t2 || m.team2?.name || "TBD",
      i1: m.i1 || m.team1?.initials || "—",
      i2: m.i2 || m.team2?.initials || "—",
      date: m.date || "TBD",
      time: m.time || "TBD",
      venue: m.venue || "TBD",
      status: m.status,
    }));

  // Points table from teams
  const pointsTable = [...teams]
    .sort((a: any, b: any) => {
      const ptDiff = ((b.won || 0) * 2) - ((a.won || 0) * 2);
      if (ptDiff !== 0) return ptDiff;
      return parseFloat(b.nrr || "0") - parseFloat(a.nrr || "0");
    })
    .map((t: any) => ({
      t: t.name,
      p: t.played || 0,
      w: t.won || 0,
      l: t.lost || 0,
      nr: 0,
      nrr: t.nrr || "0.000",
      pt: (t.won || 0) * 2,
      form: [],
    }));

  // Top players from players list (sort by composite performance score)
  const topPlayers = [...players]
    .sort((a: any, b: any) => {
      const scoreA = (a.total_runs || 0) + (a.wickets || 0) * 25 + parseFloat(a.strike_rate || "0") * 0.5;
      const scoreB = (b.total_runs || 0) + (b.wickets || 0) * 25 + parseFloat(b.strike_rate || "0") * 0.5;
      return scoreB - scoreA;
    })
    .slice(0, 6)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      team: teams.find((t: any) => t.id === p.team_id)?.name || "—",
      role: p.role || "Player",
      specialization: p.specialization || "General",
      dob: p.dob || "—",
      matches: p.matches_played || 0,
      style: {
        batting: p.style_batting || "—",
        bowling: p.style_bowling || "—",
      },
      stats: `${p.total_runs || 0} Runs • SR ${p.strike_rate || "0.00"}`,
      image: p.image || "",
      bio: p.bio || "",
      statsDetail: [
        { label: "Matches", value: String(p.matches_played || 0) },
        { label: "Strike Rate", value: String(p.strike_rate || "0.00") },
        { label: "Highest", value: String(p.highest_score || 0) },
        { label: "Fifties", value: String(p.fifties || 0) },
      ],
    }));

  // Sort teams by performance (points desc, then NRR desc)
  const sortedTeams = [...teams].sort((a: any, b: any) => {
    const ptDiff = ((b.won || 0) * 2) - ((a.won || 0) * 2);
    if (ptDiff !== 0) return ptDiff;
    return parseFloat(b.nrr || "0") - parseFloat(a.nrr || "0");
  });

  return (
    <div className="flex flex-col gap-4 pb-10 overflow-visible">
      <Hero />

      <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-visible">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4 overflow-visible">
          <TournamentBanner />

          <LiveMatch data={liveData} />

          <LastMatchOverview data={LAST_MATCH} />

          <MatchesScroll matches={upcomingMatches} />

          <HighlightsScroll highlights={HIGHLIGHTS} />

          <TeamsScroll teams={sortedTeams} />

          <TopPlayersScroll players={topPlayers.length > 0 ? topPlayers : []} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4 overflow-visible">
          <PointsTable entries={pointsTable} />

          <NewsSection news={[]} />
        </div>
      </div>
    </div>
  );
}
