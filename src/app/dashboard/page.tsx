import { createClient } from "@/lib/supabase/server";

type CaptionWithFlavor = {
  id: string;
  content: string | null;
  like_count: number | null;
  created_datetime_utc: string | null;
  humor_flavors: { slug: string | null } | { slug: string | null }[] | null;
};

type CaptionVote = {
  id: number;
  vote_value: number | null;
  created_datetime_utc: string | null;
  captions: {
    content: string | null;
    like_count: number | null;
  } | {
    content: string | null;
    like_count: number | null;
  }[] | null;
};

const formatDate = (value: string | null) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getFlavorSlug = (caption: CaptionWithFlavor) => {
  const flavor = Array.isArray(caption.humor_flavors)
    ? caption.humor_flavors[0]
    : caption.humor_flavors;

  return flavor?.slug || "Unassigned";
};

const getVotedCaption = (vote: CaptionVote) => {
  return Array.isArray(vote.captions) ? vote.captions[0] : vote.captions;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    flavors,
    steps,
    captions,
    ratedCaptions,
    totalVotes,
    upVotes,
    downVotes,
    studyVotes,
    topCaptionsRes,
    recentVotesRes,
  ] = await Promise.all([
    supabase.from("humor_flavors").select("id", { count: "exact", head: true }),
    supabase.from("humor_flavor_steps").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }).gt("like_count", 0),
    supabase.from("caption_votes").select("id", { count: "exact", head: true }),
    supabase.from("caption_votes").select("id", { count: "exact", head: true }).gt("vote_value", 0),
    supabase.from("caption_votes").select("id", { count: "exact", head: true }).lt("vote_value", 0),
    supabase.from("caption_votes").select("id", { count: "exact", head: true }).eq("is_from_study", true),
    supabase
      .from("captions")
      .select("id, content, created_datetime_utc, like_count, humor_flavors(slug)")
      .order("like_count", { ascending: false })
      .limit(5),
    supabase
      .from("caption_votes")
      .select("id, vote_value, created_datetime_utc, captions(content, like_count)")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
  ]);

  const voteCount = totalVotes.count ?? 0;
  const positiveCount = upVotes.count ?? 0;
  const negativeCount = downVotes.count ?? 0;
  const positiveRate = voteCount > 0 ? Math.round((positiveCount / voteCount) * 100) : 0;
  const topCaptions = (topCaptionsRes.data ?? []) as unknown as CaptionWithFlavor[];
  const recentVotes = (recentVotesRes.data ?? []) as unknown as CaptionVote[];

  const stats = [
    { label: "Humor Flavors", count: flavors.count ?? 0 },
    { label: "Total Steps", count: steps.count ?? 0 },
    { label: "Total Captions", count: captions.count ?? 0 },
    { label: "Rated Captions", count: ratedCaptions.count ?? 0 },
  ];

  const ratingStats = [
    { label: "Total Ratings", value: voteCount.toLocaleString(), helper: "All caption votes" },
    { label: "Upvotes", value: positiveCount.toLocaleString(), helper: `${positiveRate}% of ratings` },
    { label: "Downvotes", value: negativeCount.toLocaleString(), helper: "Captions users rejected" },
    { label: "Study Ratings", value: (studyVotes.count ?? 0).toLocaleString(), helper: "Marked study votes" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
          >
            <p className="text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.count}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Caption Rating Stats</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Live counts from the caption votes users submit in the rating app.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ratingStats.map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <p className="text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{s.helper}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Top Rated Captions</h2>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Caption</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Flavor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {topCaptions.map((caption) => (
                  <tr key={caption.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/70">
                    <td className="px-4 py-3">{caption.content || "N/A"}</td>
                    <td className="px-4 py-3 font-semibold">{caption.like_count ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                      {getFlavorSlug(caption)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Recent Ratings</h2>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Vote</th>
                  <th className="px-4 py-3">Caption</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {recentVotes.map((vote) => {
                  const caption = getVotedCaption(vote);

                  return (
                    <tr key={vote.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/70">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex min-w-16 justify-center rounded-full px-2 py-1 text-xs font-medium ${
                            (vote.vote_value ?? 0) > 0
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                          }`}
                        >
                          {(vote.vote_value ?? 0) > 0 ? "Upvote" : "Downvote"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{caption?.content || "N/A"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                        {formatDate(vote.created_datetime_utc)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
