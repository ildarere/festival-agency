import type Database from 'better-sqlite3';
import type { CreateEditionInput, CreateFestivalInput } from '../repositories/festival.repo';

interface FestivalSeed extends CreateFestivalInput {
  editions: CreateEditionInput[];
}

/**
 * Реальные фестивали короткого метра и анимации с ближайшими сезонами.
 * Даты дедлайнов приблизительные и служат для быстрого тестирования поиска и подач.
 */
const FESTIVALS: FestivalSeed[] = [
  {
    name: 'Clermont-Ferrand International Short Film Festival',
    country: 'France',
    city: 'Clermont-Ferrand',
    websiteUrl: 'https://clermont-filmfest.org',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'FilmFreeway',
    notes: 'Крупнейший в мире рынок и фестиваль короткого метра.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-01-29',
        endDate: '2027-02-06',
        earlyDeadline: '2026-09-15',
        regularDeadline: '2026-10-15',
        lateDeadline: '2026-11-02',
        notificationDate: '2026-12-11',
        premiereRequirement: 'No Requirement'
      }
    ]
  },
  {
    name: 'International Short Film Festival Oberhausen',
    country: 'Germany',
    city: 'Oberhausen',
    websiteUrl: 'https://www.kurzfilmtage.de',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'Direct',
    notes: 'Старейший фестиваль короткометражного кино (с 1954).',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-04-29',
        endDate: '2027-05-04',
        regularDeadline: '2027-01-15',
        notificationDate: '2027-03-20',
        premiereRequirement: 'International'
      }
    ]
  },
  {
    name: 'Tampere Film Festival',
    country: 'Finland',
    city: 'Tampere',
    websiteUrl: 'https://tamperefilmfestival.fi',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'FilmFreeway',
    notes: 'Международный конкурс короткого метра.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-03-10',
        endDate: '2027-03-14',
        earlyDeadline: '2026-10-01',
        regularDeadline: '2026-11-15',
        lateDeadline: '2026-12-01',
        notificationDate: '2027-01-31',
        premiereRequirement: 'No Requirement'
      }
    ]
  },
  {
    name: 'Krakow Film Festival',
    country: 'Poland',
    city: 'Krakow',
    websiteUrl: 'https://www.krakowfilmfestival.pl',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'FilmFreeway',
    notes: 'Документальный, короткий метр и анимация.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-05-30',
        endDate: '2027-06-06',
        earlyDeadline: '2026-12-15',
        regularDeadline: '2027-02-15',
        lateDeadline: '2027-03-01',
        notificationDate: '2027-04-15',
        premiereRequirement: 'No Requirement'
      }
    ]
  },
  {
    name: 'Annecy International Animation Film Festival',
    country: 'France',
    city: 'Annecy',
    websiteUrl: 'https://www.annecyfestival.com',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'Direct',
    notes: 'Главный мировой смотр анимации, включает рынок MIFA.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-06-07',
        endDate: '2027-06-12',
        earlyDeadline: '2026-11-15',
        regularDeadline: '2027-01-15',
        lateDeadline: '2027-02-15',
        notificationDate: '2027-04-10',
        premiereRequirement: 'International'
      }
    ]
  },
  {
    name: 'Palm Springs International ShortFest',
    country: 'USA',
    city: 'Palm Springs',
    websiteUrl: 'https://www.psfilmfest.org',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'FilmFreeway',
    notes: 'Крупнейший фестиваль короткого метра в Северной Америке.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-06-22',
        endDate: '2027-06-28',
        earlyDeadline: '2027-01-15',
        regularDeadline: '2027-02-19',
        lateDeadline: '2027-03-19',
        notificationDate: '2027-05-15',
        premiereRequirement: 'No Requirement'
      }
    ]
  },
  {
    name: 'Locarno Film Festival',
    country: 'Switzerland',
    city: 'Locarno',
    websiteUrl: 'https://www.locarnofestival.ch',
    accreditation: 'FIAPF_A',
    platformDefault: 'Direct',
    notes: 'Конкурс Pardi di domani для короткого метра.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-08-04',
        endDate: '2027-08-14',
        regularDeadline: '2027-04-30',
        notificationDate: '2027-06-25',
        premiereRequirement: 'International'
      }
    ]
  },
  {
    name: 'Sundance Film Festival',
    country: 'USA',
    city: 'Park City',
    websiteUrl: 'https://festival.sundance.org',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'FilmFreeway',
    notes: 'Короткий метр Sundance имеет отдельный конкурс.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-01-21',
        endDate: '2027-01-31',
        earlyDeadline: '2026-08-15',
        regularDeadline: '2026-09-19',
        lateDeadline: '2026-09-26',
        notificationDate: '2026-11-25',
        premiereRequirement: 'National'
      }
    ]
  },
  {
    name: 'Aspen Shortsfest',
    country: 'USA',
    city: 'Aspen',
    websiteUrl: 'https://www.aspenfilm.org',
    accreditation: 'Oscar_qualifying',
    platformDefault: 'FilmFreeway',
    notes: 'Небольшой, но Oscar-qualifying фестиваль короткого метра.',
    editions: [
      {
        editionYear: 2027,
        startDate: '2027-04-06',
        endDate: '2027-04-11',
        earlyDeadline: '2026-10-15',
        regularDeadline: '2026-11-19',
        lateDeadline: '2026-12-10',
        notificationDate: '2027-02-20',
        premiereRequirement: 'No Requirement'
      }
    ]
  },
  {
    name: 'Encounters Film Festival',
    country: 'United Kingdom',
    city: 'Bristol',
    websiteUrl: 'https://encounters-festival.org.uk',
    accreditation: 'BAFTA',
    platformDefault: 'FilmFreeway',
    notes: 'BAFTA- и Oscar-qualifying для короткометражной анимации и игрового кино.',
    editions: [
      {
        editionYear: 2026,
        startDate: '2026-09-22',
        endDate: '2026-09-27',
        earlyDeadline: '2026-04-24',
        regularDeadline: '2026-06-05',
        lateDeadline: '2026-06-19',
        notificationDate: '2026-08-14',
        premiereRequirement: 'Regional'
      }
    ]
  }
];

export function seedFestivals(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM festivals').get() as { count: number };
  if (count.count > 0) {
    return;
  }

  const insertFestival = db.prepare(
    `INSERT INTO festivals (name, country, city, website_url, accreditation, platform_default, notes)
     VALUES (@name, @country, @city, @websiteUrl, @accreditation, @platformDefault, @notes)`
  );
  const insertEdition = db.prepare(
    `INSERT INTO festival_editions (
      festival_id, edition_year, start_date, end_date,
      early_deadline, regular_deadline, late_deadline, notification_date, premiere_requirement
    ) VALUES (
      @festivalId, @editionYear, @startDate, @endDate,
      @earlyDeadline, @regularDeadline, @lateDeadline, @notificationDate, @premiereRequirement
    )`
  );

  const seed = db.transaction((festivals: FestivalSeed[]) => {
    for (const festival of festivals) {
      const result = insertFestival.run({
        name: festival.name,
        country: festival.country,
        city: festival.city ?? null,
        websiteUrl: festival.websiteUrl ?? null,
        accreditation: festival.accreditation ?? 'None',
        platformDefault: festival.platformDefault ?? 'FilmFreeway',
        notes: festival.notes ?? null
      });
      const festivalId = Number(result.lastInsertRowid);

      for (const edition of festival.editions) {
        insertEdition.run({
          festivalId,
          editionYear: edition.editionYear,
          startDate: edition.startDate ?? null,
          endDate: edition.endDate ?? null,
          earlyDeadline: edition.earlyDeadline ?? null,
          regularDeadline: edition.regularDeadline ?? null,
          lateDeadline: edition.lateDeadline ?? null,
          notificationDate: edition.notificationDate ?? null,
          premiereRequirement: edition.premiereRequirement ?? 'No Requirement'
        });
      }
    }
  });

  seed(FESTIVALS);
  console.log(`[seed] inserted ${FESTIVALS.length} festivals with editions`);
}
