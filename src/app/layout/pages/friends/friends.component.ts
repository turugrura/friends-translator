import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { debounceTime, finalize, of, Subject, Subscription, switchMap, take, tap } from 'rxjs';
import { FriendsService, PatchSentenceModel, SentenceModel } from '../../service/friendsService';
import { LayoutService } from '../../service/app.layout.service';

interface ISentence {
  isSentence: boolean;
  speaker: string;
  sentence: string;
  isChangeScene: boolean;
  avatar?: string;
  color?: string;
  bgColor?: string;
  raw: string;
  th: string;
  id: number;
}

enum Character {
  MONICA = 'MONICA',
  ROSS = 'ROSS',
  CHANDLER = 'CHANDLER',
  PHOEBE = 'PHOEBE',
  JOEY = 'JOEY',
  RACHEL = 'RACHEL',
}

interface PartOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  providers: [MessageService],
})
export class FriendsComponent implements OnInit, OnDestroy {
  @ViewChild('fileupload') profileImg: FileUpload;
  title = '';
  sentences: ISentence[] = [];
  parts: PartOption[] = [];
  selectedPart: string;
  subscription: Subscription;
  isUpdating = false;
  idOfEditing = null;
  idOfEditingSentence = null;

  episodeChange$ = new Subject<string>();
  episodeChangeSub: Subscription;

  toggleRowNoSub: Subscription;
  confirm$ = new Subject<boolean>();
  confirmSub: Subscription;
  ripple = this.layoutService.config.ripple;

  constructor(
    private friendsService: FriendsService,
    private messageService: MessageService,
    private layoutService: LayoutService,
  ) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.episodeChangeSub?.unsubscribe();
    this.confirmSub?.unsubscribe();
    this.toggleRowNoSub?.unsubscribe();
  }

  ngOnInit() {
    this.episodeChangeSub = this.episodeChange$.pipe(debounceTime(500)).subscribe((ep) => {
      console.log({ ep });
      localStorage.setItem('selectedPart', ep);
      this.getFriendData(ep);
    });
    this.isUpdating = true;
    this.subscription = this.getParts()
      .pipe(take(1))
      .subscribe(() => {
        setTimeout(() => {
          this.isUpdating = false;

          const cachedEp = localStorage.getItem('selectedPart');
          const lastSelected = (cachedEp === 'null' ? '6_3' : cachedEp) || '6_3';
          this.episodeChange$.next(lastSelected);
          this.selectedPart = lastSelected;
        }, 300);
      });
    this.toggleRowNoSub = this.layoutService.configUpdate$.subscribe((a) => {
      this.ripple = a.ripple;
    });
  }

  getParts() {
    return this.friendsService.getAllEpisode().pipe(
      take(1),
      tap((parts) => {
        console.log({ parts });
        this.parts = parts
          .sort((a, b) => {
            const aa = a.season * 1000 + a.episode;
            const bb = b.season * 1000 + b.episode;
            if (aa < bb) {
              return -1;
            }
            if (aa > bb) {
              return 1;
            }

            return 1;
          })
          .map((p) => {
            return {
              value: p._id,
              label: `SS${p.season}-EP${p.episode}: ${p.title}`,
            };
          });
      }),
    );
  }

  onPartChange(id: string) {
    this.episodeChange$.next(id);
  }

  getFriendData(id: string) {
    const [season, episode] = id.split('_').map((a) => +a);
    this.isUpdating = true;
    this.friendsService
      .getFriends(season, episode)
      .pipe(finalize(() => (this.isUpdating = false)))
      .subscribe((res) => {
        const { title, sentences } = res;
        this.layoutService.update({
          friendEp: `${res.season}-${res.episode}: ${title}`,
        });

        this.title = title;
        this.sentences = sentences.map((s) => {
          return this.mapSentence(s);
        });
      });
  }

  mapSentence(model: SentenceModel) {
    const { raw, speaker, sentence, th, index } = model;
    const [avatar, bgColor, color] = this.getAvatar(speaker);

    return {
      id: index,
      isSentence: !!speaker,
      isChangeScene: raw.toLowerCase().startsWith('[') || sentence?.includes('Scene'),
      speaker,
      sentence: sentence || raw,
      avatar,
      color,
      bgColor,
      th,
      raw,
    };
  }

  getAvatar(name: string) {
    if (!name) {
      return [];
    }

    switch (name.toUpperCase()) {
      case Character.JOEY:
        return ['assets/demo/images/avatar/joey2.jpg', '#d9342b', '#fff5f5'];
      case Character.CHANDLER:
        return ['assets/demo/images/avatar/chandler.jpg', '#d46213', '#f5f9ff'];
      // return ['assets/demo/images/avatar/chandler.jpg', '#a855f7', '#f5f9ff'];
      case Character.MONICA:
        return ['assets/demo/images/avatar/monica.jpg', '#059bb4', '#f3fbfd'];
      case Character.PHOEBE:
        return ['assets/demo/images/avatar/phoebe.jpg', '#c93d82', '#fef6fa'];
      case Character.RACHEL:
        return ['assets/demo/images/avatar/rachel.jpg', '#1da750', '#f4fcf7'];
      case Character.ROSS:
        return ['assets/demo/images/avatar/ross.jpg', '#5457cd', '#f7f7fe'];
    }

    return ['assets/demo/images/avatar/unknow.jpg', '#556376', '#f7f8f9'];
  }

  onInputChange(sentence: ISentence) {
    this.idOfEditing = sentence.id;
  }

  cancleEditSentence() {
    this.idOfEditingSentence = null;
  }

  onSaveSpeaker(sentenceModel: ISentence, speaker: string) {
    console.log({ sentence: sentenceModel, th: speaker });
    const { id } = sentenceModel;

    const [season, episode] = this.selectedPart.split('_').map((a) => +a);

    this.updateSentence({
      episode,
      season,
      index: id,
      fieldName: 'speaker',
      speaker,
    }).subscribe(
      () => {
        this.sentences[id] = {
          ...sentenceModel,
          speaker,
        };
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Update Speaker successful.' });
      },
      (err) => {
        console.log({ err });
        this.messageService.add({ severity: 'error', summary: 'Update Speaker failed', detail: err?.message });
      },
    );
  }

  onSaveSentence(sentenceModel: ISentence, newSentence: string) {
    const { id } = sentenceModel;

    const [season, episode] = this.selectedPart.split('_').map((a) => +a);

    this.updateSentence({
      episode,
      season,
      index: id,
      fieldName: 'sentence',
      sentence: newSentence,
    }).subscribe(
      () => {
        this.sentences[id] = {
          ...sentenceModel,
          sentence: newSentence,
        };
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Update Sentence successful.' });
      },
      (err) => {
        console.log({ err });
        this.messageService.add({ severity: 'error', summary: 'Update Sentence failed', detail: err?.message });
      },
    );
  }

  onSaveTh(sentenceModel: ISentence, updateTh: string) {
    const { id, th } = sentenceModel;
    const [season, episode] = this.selectedPart.split('_').map((a) => +a);

    this.updateSentence({
      episode,
      season,
      index: id,
      fieldName: 'th',
      th: `${th ?? ''}${updateTh}`,
    }).subscribe(
      () => {
        this.sentences[id] = {
          ...sentenceModel,
          th,
        };
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Update TH successful.' });
      },
      (err) => {
        console.log({ err });
        this.messageService.add({ severity: 'error', summary: 'Update TH failed', detail: err?.message });
      },
    );
  }

  onSaveAll(sentenceModel: ISentence, sentence: string, th: string, speaker: string) {
    const { id } = sentenceModel;
    const [season, episode] = this.selectedPart.split('_').map((a) => +a);

    this.updateSentence({
      episode,
      season,
      index: id,
      fieldName: 'th',
      sentence,
      th,
      speaker,
    }).subscribe(
      () => {
        this.sentences[id] = {
          ...this.mapSentence({ ...(sentenceModel as any), index: id, th, sentence, speaker }),
        };
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Update ALL successful.' });
      },
      (err) => {
        console.log({ err });
        this.messageService.add({ severity: 'error', summary: 'Update ALL failed', detail: err?.message });
      },
    );
  }

  onReject() {
    this.messageService.clear('c');
    this.confirm$.next(false);
  }
  onConfirm(_) {
    this.messageService.clear('c');
    this.confirm$.next(true);
  }

  updateSentence(data: PatchSentenceModel) {
    this.isUpdating = true;
    if (this.ripple) {
      return this.friendsService.updateSentence(data).pipe(
        tap({
          complete: () => {
            this.idOfEditingSentence = null;
          },
        }),
        finalize(() => {
          this.isUpdating = false;
        }),
      );
    }

    this.messageService.add({
      key: 'c',
      sticky: true,
      severity: 'warn',
      summary: 'Are you sure?',
      detail: 'Confirm to proceed',
      data,
    });

    return this.confirm$.pipe(
      take(1),
      switchMap((isConfirm) => {
        if (isConfirm) {
          return this.friendsService.updateSentence(data).pipe(
            tap({
              complete: () => {
                this.idOfEditingSentence = null;
              },
            }),
            finalize(() => {
              this.isUpdating = false;
            }),
          );
        }
        this.isUpdating = false;

        return of();
      }),
    );
  }
}
