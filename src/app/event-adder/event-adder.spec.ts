import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAdder } from './event-adder';

describe('EventAdder', () => {
  let component: EventAdder;
  let fixture: ComponentFixture<EventAdder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAdder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAdder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
