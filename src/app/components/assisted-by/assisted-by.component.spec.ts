import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistedByComponent } from './assisted-by.component';

describe('AssistedByComponent', () => {
  let component: AssistedByComponent;
  let fixture: ComponentFixture<AssistedByComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssistedByComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssistedByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
