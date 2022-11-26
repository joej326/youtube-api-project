import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

  /** 
  if any of the words (long words don't wrap and will ruin the flow) 
  in the video title are longer than the maxLength, cut the title string and add "..."
  */
  transform(value: string, maxLength: number): string {

    return value.split(' ').some((str) => str.length > 35) ? 
      value.substring(0, maxLength) + '...' : 
      value;
  }

}
