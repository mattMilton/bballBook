import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FreeThrowsPage } from './free-throws.page';

const routes: Routes = [
  {
    path: '',
    component: FreeThrowsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FreeThrowsPage]
})
export class FreeThrowsPageModule {}
