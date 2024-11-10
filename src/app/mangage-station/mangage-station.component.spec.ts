import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangageStationComponent } from './mangage-station.component';

describe('MangageStationComponent', () => {
  let component: MangageStationComponent;
  let fixture: ComponentFixture<MangageStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MangageStationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MangageStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
