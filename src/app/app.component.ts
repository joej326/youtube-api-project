import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY, expand, of, takeWhile } from 'rxjs';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  channels: any = [];

  videos: any = [];
  nextPageToken: string = '';
  prevPageToken: string = '';
  form: FormGroup = new FormGroup({});
  isLastPage: boolean = false;
  fetchedChannelId: string = '';

  constructor(private api: ApiService) { }


  ngOnInit() {

    this.form = new FormGroup({
      channelSearchQuery: new FormControl('')
    });
  }

  onPageChange(event: 'previous' | 'next') {
    this.api.getChannelVideos(this.fetchedChannelId, (event === 'next' ? this.nextPageToken : this.prevPageToken)).subscribe(
      (data: any) => {
        console.log('next page data:', data);
        this.videos = [...data.items];
        this.nextPageToken = data.nextPageToken || '';
        this.prevPageToken = data.prevPageToken || '';
      }
    );
  }

  searchForChannel() {
    console.log(this.form.get('channelSearchQuery')?.value);
    this.api.searchForChannel(this.form.get('channelSearchQuery')?.value).subscribe(
      (data: any) => {
        console.log(data);
        this.channels = [...data.items];
      }
    );
  }

  onChannelSelect(channel: any) {
    console.log(channel);
    this.channels = [];
    this.fetchedChannelId = channel.id.channelId;

    this.api.getChannelVideos('', '').pipe(
        expand((data: any) => data.nextPageToken ? this.api.getChannelVideos(this.fetchedChannelId, data.nextPageToken) : of('last page'))
      ).subscribe(
      (data: any) => {
        if (data === 'last page') {
          this.isLastPage = true;
          return;
        }
        console.log('data:', data);
        if (data.items) {
          this.videos = [...data.items];
        }
        this.nextPageToken = data.nextPageToken;
        this.prevPageToken = data.prevPageToken;
      }
    );
  }
}
