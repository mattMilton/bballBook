import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReboundedByComponent } from './rebounded-by.component';

describe('ReboundedByComponent', () => {
  let component: ReboundedByComponent;
  let fixture: ComponentFixture<ReboundedByComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReboundedByComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReboundedByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
