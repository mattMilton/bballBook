import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MadeFgPage } from './made-fg.page';

describe('MadeFgPage', () => {
  let component: MadeFgPage;
  let fixture: ComponentFixture<MadeFgPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MadeFgPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MadeFgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
