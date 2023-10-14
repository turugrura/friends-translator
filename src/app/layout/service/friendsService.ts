import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, ReplaySubject, tap } from 'rxjs';

export interface SentenceModel {
  raw: string;
  speaker?: string;
  sentence?: string;
  th: string;
  index: number;
}

export interface FriendModel {
  _id: string;
  season: number;
  episode: number;
  title: string;
  sentences: SentenceModel[];
}

export interface EpisodeModel {
  season: number;
  episode: number;
}

export interface PatchSentenceModel {
  season: number;
  episode: number;
  index: number;
  fieldName: 'speaker' | 'sentence' | 'th';
  th?: string;
  speaker?: string;
  sentence?: string;
}

const partNames = [
  '0601',
  '0602',
  '0603',
  '0604',
  '0605',
  '0606',
  '0607',
  '0608',
  '0609',
  '0610',
  '0611',
  '0612',
  '0613',
  '0614',
  '0615-0616',
  '0617',
  '0618',
  '0619',
  '0620',
  '0621',
  '0622',
  '0623',
  '0624',
  '0701',
  '0702',
  '0703',
  '0704',
  '0705',
  '0706',
  '0707',
  '0708',
  '0709',
  '0710',
  '0711',
  '0712',
  '0713',
  '0714',
  '0715',
  '0716',
  '0717',
  '0718',
  '0719',
  '0720',
  '0721',
  '0722',
  '0723',
  '0801',
  '0802',
  '0803',
  '0804',
  '0805',
  '0806',
  '0807',
  '0808',
  '0809',
  '0810',
  '0811',
  '0812',
  '0813',
  '0814',
  '0815',
  '0816',
  '0817',
  '0818',
  '0819',
  '0820',
  '0821',
  '0822',
  '0823',
  '0901',
  '0902',
  '0903',
  '0904',
  '0905',
  '0906',
  '0907',
  '0908',
  '0909',
  '0910',
  '0911',
  '0912',
  '0913',
  '0914',
  '0915',
  '0916',
  '0917',
  '0918',
  '0919',
  '0920',
  '0921',
  '0922',
  '0923-0924',
  '1001',
  '1002',
  '1003',
  '1004',
  '1005',
  '1006',
  '1007',
  '1008',
  '1009',
  '1010',
  '1011',
  '1012',
  '1013',
  '1014',
  '1015',
  '1016',
  '1017-1018',
];

@Injectable()
export class FriendsService {
  private loadDataSuccessed = new ReplaySubject(1);
  private episodes: Omit<FriendModel, 'sentences'>[] = [];
  private cached: { [key: string]: FriendModel } = {};
  private baseUrl = localStorage.getItem('friendsAPI');

  constructor(private http: HttpClient) {
    // this.loadData();
  }

  private loadData() {
    const reqs = partNames.map((part) =>
      this.http.get<FriendModel>(`assets/demo/data/friends2/${part}.json`).pipe(catchError(() => of(null))),
    );
    forkJoin(reqs).subscribe((responses) => {
      // this.parts = responses
      //   .map((res, idx) => {
      //     const partNo = partNames[idx];
      //     this.cached[partNo] = res;

      //     return {
      //       partNo,
      //       partName: res.title,
      //     };
      //   });

      const p = [];
      responses.forEach((res, idx) => {
        if (res == null) return;

        const partNo = partNames[idx];
        this.cached[partNo] = res;

        p.push({
          partNo,
          partName: res.title,
        });
      });
      // this.parts = p;

      this.loadDataSuccessed.next(1);
    });
  }

  getAllEpisode(): Observable<Omit<FriendModel, 'sentences'>[]> {
    if (this.episodes.length > 0) {
      return of(this.episodes);
    }

    return this.http.get(`${this.baseUrl}/friend_translators`).pipe(
      map((d) => d['data'] as Omit<FriendModel, 'sentences'>[]),
      tap((data) => {
        this.episodes = data;
      }),
    );
  }

  getFriends(season: number, episode: number) {
    const cacheKey = `${season}_${episode}`;
    const cachedVal = this.cached[cacheKey];
    if (cachedVal) {
      return of(cachedVal);
    }

    return this.http.get<FriendModel>(`${this.baseUrl}/friend_translators/${season}/${episode}`).pipe(
      map((d) => d['data'] as FriendModel),
      tap((data) => {
        this.cached[cacheKey] = data;
      }),
    );
  }

  updateSentence(data: PatchSentenceModel) {
    const cacheKey = `${data.season}_${data.episode}`;
    this.cached[cacheKey] = undefined;

    return this.http.post(`${this.baseUrl}/friend_translators/sentences`, data);
  }
}
