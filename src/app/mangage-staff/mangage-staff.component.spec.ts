import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangageStaffComponent } from './mangage-staff.component';

describe('MangageStaffComponent', () => {
  let component: MangageStaffComponent;
  let fixture: ComponentFixture<MangageStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MangageStaffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MangageStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
