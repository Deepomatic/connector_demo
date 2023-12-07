import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';


const ReturnFlows = ['before_analysis', 'after_analysis', 'after_work_order'] as const;
type ReturnFlow = typeof ReturnFlows[number];

interface Token {
  idx: number;
  token: string;
  returnFlow: ReturnFlow;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
  public constructor(
    private router: Router,
  ) { }
  public get connectorTokens(): Token[] {
    return [
      {
        idx: 1,
        token: 'oneclickphoto',
        returnFlow: 'after_analysis',
      },
      {
        idx: 2,
        token: 'oneclickphotonoanalysis',
        returnFlow: 'before_analysis',
      },
    ];
  }

  public onConnectorTokenClicked(token: Token): void {
    this.router.navigate([token.token]);
  }
}
