const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql?format=json';
const USER_AGENT = 'EWA-FestivalManager/1.0 (desktop-client)';
const REQUEST_TIMEOUT_MS = 20_000;

export interface WikidataFestivalItem {
  qid: string;
  name: string;
  country: string | null;
  city: string | null;
  websiteUrl: string | null;
}

interface SparqlBindingValue {
  type: string;
  value: string;
  'xml:lang'?: string;
}

interface SparqlResponse {
  results: {
    bindings: Array<Record<string, SparqlBindingValue | undefined>>;
  };
}

/** Экранирование пользовательского ввода для строкового литерала внутри REGEX() SPARQL. */
function escapeForRegex(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[.*+?^${}()|[\]]/g, '\\$&');
}

function buildQuery(query: string, limit: number): string {
  const needle = escapeForRegex(query.trim());
  return `
SELECT ?festival ?festivalLabel ?countryLabel ?locationLabel ?website WHERE {
  ?festival wdt:P31 wd:Q220505 .
  ?festival rdfs:label ?festivalLabel .
  FILTER(LANG(?festivalLabel) = "en")
  FILTER(REGEX(?festivalLabel, "${needle}", "i"))
  OPTIONAL { ?festival wdt:P17 ?country . }
  OPTIONAL { ?festival wdt:P276 ?location . }
  OPTIONAL { ?festival wdt:P856 ?website . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT ${Math.max(1, Math.min(limit, 100))}
`.trim();
}

function qidFromUri(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] ?? uri;
}

export async function searchFestivals(query: string, limit = 25): Promise<WikidataFestivalItem[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = `${SPARQL_ENDPOINT}&query=${encodeURIComponent(buildQuery(query, limit))}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': USER_AGENT
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Wikidata SPARQL вернул статус ${response.status}`);
  }

  const data = (await response.json()) as SparqlResponse;
  const byQid = new Map<string, WikidataFestivalItem>();

  for (const binding of data.results.bindings) {
    const festivalUri = binding.festival?.value;
    if (!festivalUri) {
      continue;
    }
    const qid = qidFromUri(festivalUri);
    const existing = byQid.get(qid);

    const name = binding.festivalLabel?.value ?? qid;
    const country = binding.countryLabel?.value ?? null;
    const city = binding.locationLabel?.value ?? null;
    const websiteUrl = binding.website?.value ?? null;

    if (!existing) {
      byQid.set(qid, { qid, name, country, city, websiteUrl });
    } else {
      // Дополняем недостающие поля из повторных строк (OPTIONAL даёт дубликаты).
      byQid.set(qid, {
        qid,
        name: existing.name || name,
        country: existing.country ?? country,
        city: existing.city ?? city,
        websiteUrl: existing.websiteUrl ?? websiteUrl
      });
    }
  }

  return [...byQid.values()];
}
