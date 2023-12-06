import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Buffer } from 'buffer';
import { ThemePalette } from '@angular/material/core';

type AnalysisStatus = 'analysis_ok' | 'analysis_ko' | 'canceled_picture' | 'conformity_error';

interface Index {
  idx: number;
}

interface Analysis {
  input_id: string;
  status: AnalysisStatus;
}

interface WorkItem {
  id: string;
  progress: number;
  analyses: Record<string, Analysis>;
}

interface IState {
  work_order_id: string;
  work_items: Record<string, WorkItem>;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
  ]
})
export class IndexComponent implements OnInit {
  private _state: IState = {} as IState;

  public constructor(
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    console.log("Previous state: ", this.state);
    this.updateState();
    console.log("New state: ", this._state);
  }

  private updateState(): void {
    const state = this.state;
    if (this.workOrderId) {
      state.work_order_id = this.workOrderId;
    }
    if (this.workItemId) {
      const workItems = state?.work_items ?? {};
      const workItem = workItems[this.workItemId] ?? { id: this.workItemId, progress: 100, analyses: {} };
      if (this.inputId) {
        const analysis = workItem.analyses[this.inputId] ?? { input_id: this.inputId, status: 'analysis_ok' };
        if (this.status) {
          analysis.status = this.status;
        }
        workItem.analyses[this.inputId] = analysis;
      }
      if (this.workItemProgress) {
        workItem.progress = this.workItemProgress;
      }
      workItems[this.workItemId] = workItem;
      state.work_items = workItems;
    }
    this._state = state;
  }

  private get oneClickToken(): string {
    return this.route.snapshot.paramMap.get('one_click_token') as string;
  }

  private get workOrderId(): string | null {
    return this.route.snapshot.queryParamMap.get('work_order_id');
  }

  private get workItemId(): string | null {
    return this.route.snapshot.queryParamMap.get('work_item_id');
  }

  private get state(): IState {
    const state = this.route.snapshot.queryParamMap.get('state');
    if (state === null) {
      return {
        work_order_id: null,
        work_items: {},
      } as unknown as IState;
    }
    return JSON.parse(Buffer.from(state, 'base64').toString('utf8')) as IState;
  }

  private get inputId(): string | null {
    return this.route.snapshot.queryParamMap.get('input_id');
  }

  private get workItemProgress(): number | null {
    const workItemProgress = this.route.snapshot.queryParamMap.get('work_item_progress');
    return workItemProgress ? parseInt(workItemProgress, 10) : null;
  }

  private get status(): 'canceled_picture' | 'analysis_ko' | 'analysis_ok' | 'conformity_error' | null {
    const status = this.route.snapshot.queryParamMap.get('status');
    return status ? status as any : null;
  }

  private get stateToSend(): string {
    return Buffer.from(JSON.stringify(this._state)).toString('base64');
  }

  public get workItems(): (WorkItem & Index)[] {
    return Object.values(this._state?.work_items ?? {}).map((workItem, idx) => ({...workItem, idx: idx + 1}));
  }

  public getAnalyses(workItem: WorkItem): (Analysis & Index)[] {
    return Object.values(workItem.analyses).map((analysis, idx) => ({...analysis, idx: idx +1}));
  }

  public onWorkItemClicked(workItem: WorkItem) {
    window.location.href = `https://staging.vesta.deepomatic.com/field/connector/${this.oneClickToken}/work_item/${workItem.id}?state=${this.stateToSend}`;
  }

  public onAnalysisClicked(workItem: WorkItem, analysis: Analysis) {
    window.location.href = `https://staging.vesta.deepomatic.com/field/connector/${this.oneClickToken}/input/${analysis.input_id}?state=${this.stateToSend}`;
  }

  public onAddItemClicked() {
    const paramsObj: Record<string, string> = {
      task_group_name: "powermeter_1",
      state: this.stateToSend,
    };
    if (this.workOrderId) {
      paramsObj['work_order_id'] = this.workOrderId;
    } else {
      const today = new Date();
      paramsObj['work_order_name'] = `demo-${today.toISOString().split('T')[0]}`;
      paramsObj['wo_metadata'] = Buffer.from(JSON.stringify({
        "rack": "rack4",
        "frame": "frame1",
        "region": "SOUTH",
        "site_id": "lut3",
        "wo_type": "XGSPON",
        "cassette": "cd108",
        "hardware": "sc1",
        "to_ports": "1,2,3,4,5,6,7,8,9",
        "from_ports": "sm05_sp1_p2,sm05_sp2_p1,sm05_sp2_p2,sm06_sp1_p1,sm06_sp1_p2,sm06_sp2_p1,sm06_sp2_p2,sm07_sp1_p1,sm07_sp1_p2",
        "cassette_id": "lut3_frame1_cd108",
        "hardware_id": "lut3_sc1",
        "odf_frame_id": "lut3_frame1",
        "salesforce_id": "1011948",
        "subcontractor": "Indigo",
        "installation_date": "12/5/2023",
      })).toString('base64');
    }
    const params = Object.keys(paramsObj).map(key => `${key}=${paramsObj[key]}`).join('&');
    window.location.href = `https://staging.vesta.deepomatic.com/field/connector/${this.oneClickToken}/work_item/create?${params}`;
  }

  public getProgressColor(workItem: WorkItem): ThemePalette {
    if (workItem.progress > 90) {
      return 'primary';
    }
    if (workItem.progress > 60) {
      return 'accent';
    }
    return 'warn';
  }
}
