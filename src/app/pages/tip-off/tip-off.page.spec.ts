import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TipOffPage } from './tip-off.page';

describe('TipOffPage', () => {
  let component: TipOffPage;
  let fixture: ComponentFixture<TipOffPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TipOffPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TipOffPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
