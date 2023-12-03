import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ServiceService } from './service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ServiceService]
})
export class AppComponent implements AfterViewInit
{
  @ViewChild('enableWebcamButton') enableWebcamButton!: HTMLButtonElement;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  constructor(public service: ServiceService)
  {

  }

  ngAfterViewInit(): void
  {
    console.log(this.canvasElement);

    this.service.enableWebcamButton = this.enableWebcamButton;
    this.service.video = this.video.nativeElement;
    this.service.canvasElement = this.canvasElement.nativeElement;
    this.service.canvasCtx = this.canvasElement.nativeElement.getContext('2d');
  }
}
