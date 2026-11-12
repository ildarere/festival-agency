import type Database from 'better-sqlite3';

export type PremiereStatus = 'World' | 'International' | 'National' | 'None';

export type FilmStatus =
  | 'Draft'
  | 'Materials_Pending'
  | 'Ready_For_Submissions'
  | 'In_Submissions'
  | 'Completed';

export interface Film {
  id: number;
  clientId: number;
  titleOriginal: string;
  titleIntl: string | null;
  year: number;
  durationMin: number;
  genre: string | null;
  director: string;
  producer: string | null;
  synopsisShort: string | null;
  synopsisLong: string | null;
  premiereStatus: PremiereStatus;
  aspectRatio: string | null;
  soundFormat: string | null;
  screenerUrl: string | null;
  screenerPassword: string | null;
  subtitlesUrl: string | null;
  pressKitUrl: string | null;
  stillsFolderUrl: string | null;
  trailerUrl: string | null;
  dialogueListUrl: string | null;
  dcpCloudUrl: string | null;
  status: FilmStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFilmInput {
  clientId: number;
  titleOriginal: string;
  titleIntl?: string | null;
  year: number;
  durationMin: number;
  genre?: string | null;
  director: string;
  producer?: string | null;
  synopsisShort?: string | null;
  synopsisLong?: string | null;
  premiereStatus?: PremiereStatus;
  aspectRatio?: string | null;
  soundFormat?: string | null;
  screenerUrl?: string | null;
  screenerPassword?: string | null;
  subtitlesUrl?: string | null;
  pressKitUrl?: string | null;
  stillsFolderUrl?: string | null;
  trailerUrl?: string | null;
  dialogueListUrl?: string | null;
  dcpCloudUrl?: string | null;
  status?: FilmStatus;
}

export type UpdateFilmInput = Partial<Omit<CreateFilmInput, 'clientId'>>;

interface FilmRow {
  id: number;
  client_id: number;
  title_original: string;
  title_intl: string | null;
  year: number;
  duration_min: number;
  genre: string | null;
  director: string;
  producer: string | null;
  synopsis_short: string | null;
  synopsis_long: string | null;
  premiere_status: string;
  aspect_ratio: string | null;
  sound_format: string | null;
  screener_url: string | null;
  screener_password: string | null;
  subtitles_url: string | null;
  press_kit_url: string | null;
  stills_folder_url: string | null;
  trailer_url: string | null;
  dialogue_list_url: string | null;
  dcp_cloud_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: FilmRow): Film {
  return {
    id: row.id,
    clientId: row.client_id,
    titleOriginal: row.title_original,
    titleIntl: row.title_intl,
    year: row.year,
    durationMin: row.duration_min,
    genre: row.genre,
    director: row.director,
    producer: row.producer,
    synopsisShort: row.synopsis_short,
    synopsisLong: row.synopsis_long,
    premiereStatus: row.premiere_status as PremiereStatus,
    aspectRatio: row.aspect_ratio,
    soundFormat: row.sound_format,
    screenerUrl: row.screener_url,
    screenerPassword: row.screener_password,
    subtitlesUrl: row.subtitles_url,
    pressKitUrl: row.press_kit_url,
    stillsFolderUrl: row.stills_folder_url,
    trailerUrl: row.trailer_url,
    dialogueListUrl: row.dialogue_list_url,
    dcpCloudUrl: row.dcp_cloud_url,
    status: row.status as FilmStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class FilmRepository {
  constructor(private readonly db: Database.Database) {}

  getByClientId(clientId: number): Film[] {
    const rows = this.db
      .prepare('SELECT * FROM films WHERE client_id = ? ORDER BY created_at DESC')
      .all(clientId) as FilmRow[];
    return rows.map(mapRow);
  }

  getById(id: number): Film | null {
    const row = this.db.prepare('SELECT * FROM films WHERE id = ?').get(id) as FilmRow | undefined;
    return row ? mapRow(row) : null;
  }

  create(input: CreateFilmInput): Film {
    const result = this.db
      .prepare(
        `INSERT INTO films (
          client_id, title_original, title_intl, year, duration_min, genre, director, producer,
          synopsis_short, synopsis_long, premiere_status, aspect_ratio, sound_format,
          screener_url, screener_password, subtitles_url, press_kit_url, stills_folder_url,
          trailer_url, dialogue_list_url, dcp_cloud_url, status, updated_at
        ) VALUES (
          @clientId, @titleOriginal, @titleIntl, @year, @durationMin, @genre, @director, @producer,
          @synopsisShort, @synopsisLong, @premiereStatus, @aspectRatio, @soundFormat,
          @screenerUrl, @screenerPassword, @subtitlesUrl, @pressKitUrl, @stillsFolderUrl,
          @trailerUrl, @dialogueListUrl, @dcpCloudUrl, @status, CURRENT_TIMESTAMP
        )`
      )
      .run({
        clientId: input.clientId,
        titleOriginal: input.titleOriginal,
        titleIntl: input.titleIntl ?? null,
        year: input.year,
        durationMin: input.durationMin,
        genre: input.genre ?? null,
        director: input.director,
        producer: input.producer ?? null,
        synopsisShort: input.synopsisShort ?? null,
        synopsisLong: input.synopsisLong ?? null,
        premiereStatus: input.premiereStatus ?? 'World',
        aspectRatio: input.aspectRatio ?? null,
        soundFormat: input.soundFormat ?? null,
        screenerUrl: input.screenerUrl ?? null,
        screenerPassword: input.screenerPassword ?? null,
        subtitlesUrl: input.subtitlesUrl ?? null,
        pressKitUrl: input.pressKitUrl ?? null,
        stillsFolderUrl: input.stillsFolderUrl ?? null,
        trailerUrl: input.trailerUrl ?? null,
        dialogueListUrl: input.dialogueListUrl ?? null,
        dcpCloudUrl: input.dcpCloudUrl ?? null,
        status: input.status ?? 'Draft'
      });

    const film = this.getById(Number(result.lastInsertRowid));
    if (!film) {
      throw new Error('Failed to create film');
    }
    return film;
  }

  update(id: number, input: UpdateFilmInput): Film {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Film ${id} not found`);
    }

    const merged: Omit<CreateFilmInput, 'clientId'> = {
      titleOriginal: input.titleOriginal ?? existing.titleOriginal,
      titleIntl: input.titleIntl !== undefined ? input.titleIntl : existing.titleIntl,
      year: input.year ?? existing.year,
      durationMin: input.durationMin ?? existing.durationMin,
      genre: input.genre !== undefined ? input.genre : existing.genre,
      director: input.director ?? existing.director,
      producer: input.producer !== undefined ? input.producer : existing.producer,
      synopsisShort: input.synopsisShort !== undefined ? input.synopsisShort : existing.synopsisShort,
      synopsisLong: input.synopsisLong !== undefined ? input.synopsisLong : existing.synopsisLong,
      premiereStatus: input.premiereStatus ?? existing.premiereStatus,
      aspectRatio: input.aspectRatio !== undefined ? input.aspectRatio : existing.aspectRatio,
      soundFormat: input.soundFormat !== undefined ? input.soundFormat : existing.soundFormat,
      screenerUrl: input.screenerUrl !== undefined ? input.screenerUrl : existing.screenerUrl,
      screenerPassword:
        input.screenerPassword !== undefined ? input.screenerPassword : existing.screenerPassword,
      subtitlesUrl: input.subtitlesUrl !== undefined ? input.subtitlesUrl : existing.subtitlesUrl,
      pressKitUrl: input.pressKitUrl !== undefined ? input.pressKitUrl : existing.pressKitUrl,
      stillsFolderUrl:
        input.stillsFolderUrl !== undefined ? input.stillsFolderUrl : existing.stillsFolderUrl,
      trailerUrl: input.trailerUrl !== undefined ? input.trailerUrl : existing.trailerUrl,
      dialogueListUrl:
        input.dialogueListUrl !== undefined ? input.dialogueListUrl : existing.dialogueListUrl,
      dcpCloudUrl: input.dcpCloudUrl !== undefined ? input.dcpCloudUrl : existing.dcpCloudUrl,
      status: input.status ?? existing.status
    };

    this.db
      .prepare(
        `UPDATE films SET
          title_original = @titleOriginal, title_intl = @titleIntl, year = @year,
          duration_min = @durationMin, genre = @genre, director = @director, producer = @producer,
          synopsis_short = @synopsisShort, synopsis_long = @synopsisLong, premiere_status = @premiereStatus,
          aspect_ratio = @aspectRatio, sound_format = @soundFormat, screener_url = @screenerUrl,
          screener_password = @screenerPassword, subtitles_url = @subtitlesUrl, press_kit_url = @pressKitUrl,
          stills_folder_url = @stillsFolderUrl, trailer_url = @trailerUrl, dialogue_list_url = @dialogueListUrl,
          dcp_cloud_url = @dcpCloudUrl, status = @status, updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      )
      .run({ ...merged, id });

    const updated = this.getById(id);
    if (!updated) {
      throw new Error('Failed to update film');
    }
    return updated;
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM films WHERE id = ?').run(id);
  }
}
