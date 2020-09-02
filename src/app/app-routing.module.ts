import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: 'start', loadChildren: './pages/start/start.module#StartPageModule' },
  { path: 'game-setup', loadChildren: './pages/game-setup/game-setup.module#GameSetupPageModule' },
  { path: 'team-setup', loadChildren: './pages/team-setup/team-setup.module#TeamSetupPageModule' },
  { path: 'team-edit/:id', loadChildren: './pages/team-edit/team-edit.module#TeamEditPageModule' },
  // { path: 'game', redirectTo: 'game/' },
  // { path: 'game/:clockstop', loadChildren: './pages/game/game.module#GamePageModule' },
  { path: 'game', loadChildren: './pages/game/game.module#GamePageModule' },
  { path: 'made-fg/:pts/:period/:minutes/:seconds', loadChildren: './pages/made-fg/made-fg.module#MadeFgPageModule' },
  { path: 'missed-fg/:type/:period/:minutes/:seconds', loadChildren: './pages/missed-fg/missed-fg.module#MissedFgPageModule' },
  { path: 'substitute/:team/:number/:dir/:period/:minutes/:seconds', loadChildren: './pages/substitute/substitute.module#SubstitutePageModule' },
  { path: 'turnover/:period/:minutes/:seconds', loadChildren: './pages/turnover/turnover.module#TurnoverPageModule' },
  { path: 'foul/:period/:minutes/:seconds', loadChildren: './pages/foul/foul.module#FoulPageModule' },
  { path: 'free-throws/:reason/:team/:period/:minutes/:seconds', loadChildren: './pages/free-throws/free-throws.module#FreeThrowsPageModule' },
  { path: 'technical/:period/:minutes/:seconds', loadChildren: './pages/technical/technical.module#TechnicalPageModule' },
  { path: 'tip-off/:period', loadChildren: './pages/tip-off/tip-off.module#TipOffPageModule' },
  { path: 'add-player/:team', loadChildren: './pages/add-player/add-player.module#AddPlayerPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
