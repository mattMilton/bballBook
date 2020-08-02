import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StolenByComponent } from './stolen-by.component';

describe('StolenByComponent', () => {
  let component: StolenByComponent;
  let fixture: ComponentFixture<StolenByComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StolenByComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StolenByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
