import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationRhComponent } from './validation-rh';

describe('ValidationRh', () => {
  let component: ValidationRhComponent;
  let fixture: ComponentFixture<ValidationRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
