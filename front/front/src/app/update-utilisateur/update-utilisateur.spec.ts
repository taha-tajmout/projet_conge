import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUtilisateur } from './update-utilisateur';

describe('UpdateUtilisateur', () => {
  let component: UpdateUtilisateur;
  let fixture: ComponentFixture<UpdateUtilisateur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateUtilisateur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateUtilisateur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
