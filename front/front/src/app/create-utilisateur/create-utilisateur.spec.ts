import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUtilisateur } from './create-utilisateur';

describe('CreateUtilisateur', () => {
  let component: CreateUtilisateur;
  let fixture: ComponentFixture<CreateUtilisateur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUtilisateur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUtilisateur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
