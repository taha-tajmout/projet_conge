import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDemandesComponent } from './gestion-demandes';

describe('GestionDemandes', () => {
  let component: GestionDemandesComponent;
  let fixture: ComponentFixture<GestionDemandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionDemandesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionDemandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
