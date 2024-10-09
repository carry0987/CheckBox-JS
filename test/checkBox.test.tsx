import { CheckBox } from '@/component/checkBox';
import { render, fireEvent } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';

// Render your HTML content in the document
describe('CheckBox Integration Test', () => {
    it('should initialize CheckBox correctly', () => {
        const { container } = render(
            <div id="app">
                <input type="checkbox" id="check-all" title="Check All" />
                <div class="check-box-list">
                    <input type="checkbox" name="check-1" data-checkbox-id="check-1" value="Test-1" />
                    <label data-checkbox-for="check-1" class="test">
                        Check-1
                    </label>
                    <input type="checkbox" name="check-2" id="check-2" value="Test-2" />
                    <label for="check-2">Check-2</label>
                    <input type="checkbox" name="check-3" id="check-3" value="Test-3" />
                    <label for="check-3">Check-3</label>
                </div>
            </div>
        );

        const checkBox = new CheckBox(container.querySelectorAll('#app .check-box-list input'), {
            bindLabel: true,
            checkAll: ['#check-all'],
            allowShiftKey: true
        });

        // It should find 3 checkboxes
        expect(checkBox.elements.length).toBe(3);
    });

    it('should check the checkboxes when check-all is triggered', () => {
        const { container } = render(
            <div id="app">
                <input type="checkbox" id="check-all" title="Check All" />
                <div class="check-box-list">
                    <input type="checkbox" name="check-1" data-checkbox-id="check-1" value="Test-1" />
                    <label data-checkbox-for="check-1" class="test">
                        Check-1
                    </label>
                    <input type="checkbox" name="check-2" id="check-2" value="Test-2" />
                    <label for="check-2">Check-2</label>
                    <input type="checkbox" name="check-3" id="check-3" value="Test-3" />
                    <label for="check-3">Check-3</label>
                </div>
            </div>
        );

        const checkBox = new CheckBox(container.querySelectorAll('#app .check-box-list input'), {
            checkAll: ['#check-all']
        });

        // Get and simulate check-all click event
        const checkAllInput = container.querySelector('#check-all');
        if (checkAllInput) {
            fireEvent.click(checkAllInput);

            // Check if all checkboxes under check-box-list are checked
            checkBox.elements.forEach((checkbox) => {
                expect(checkbox.checked).toBe(true);
            });
        }
    });
});
