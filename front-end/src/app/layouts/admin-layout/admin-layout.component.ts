import { Component, OnInit } from '@angular/core'
import { ClarificationService } from 'src/app/services/clarification.service'

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  public sidebarColor: string = 'green'
  choosedAIModelType = 'finetune'

  constructor(private clarificationService: ClarificationService) {}
  changeSidebarColor(color) {
    var sidebar = document.getElementsByClassName('sidebar')[0]
    var mainPanel = document.getElementsByClassName('main-panel')[0]

    this.sidebarColor = color

    if (sidebar != undefined) {
      sidebar.setAttribute('data', color)
    }
    if (mainPanel != undefined) {
      mainPanel.setAttribute('data', color)
    }
  }
  changeDashboardColor(color) {
    var body = document.getElementsByTagName('body')[0]
    if (body && color === 'white-content') {
      body.classList.add(color)
    } else if (body.classList.contains('white-content')) {
      body.classList.remove('white-content')
    }
  }
  ngOnInit() {}

  switchOpenAIModel(modelType) {
    this.choosedAIModelType = modelType

    this.clarificationService.setOpenAIModel(this.choosedAIModelType)
  }
}
