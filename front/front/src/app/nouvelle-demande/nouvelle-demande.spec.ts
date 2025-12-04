import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouvelleDemande } from './nouvelle-demande';

describe('NouvelleDemande', () => {
  let component: NouvelleDemande;
  let fixture: ComponentFixture<NouvelleDemande>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouvelleDemande]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NouvelleDemande);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
