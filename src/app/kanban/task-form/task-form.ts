import { CommonModule } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../core/interfaces/task.interface';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule, 
    MatChipsModule, 
    MatIconModule
  ],
  templateUrl: './task-form.html'
})
export class TaskForm {
  private fb = inject(FormBuilder);
  public data = inject<{ task?: Task }>(MAT_DIALOG_DATA);

  readonly dialogRef = inject(MatDialogRef<TaskForm>);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly newTask = model(this.data);


  public tags = signal<string[]>(this.data?.task?.tags ?? []);

  public form: FormGroup = this.fb.group({
    name: [this.data?.task?.name ?? '', [Validators.required, Validators.minLength(3)]],
    position: [this.data?.task?.position ?? 0, [Validators.required, Validators.min(0)]],
    completed: [this.data?.task?.completed ?? false], 
  });

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.update(tags => [...tags, value]);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    this.tags.update(tags => tags.filter(t => t !== tag));
  }

  onSave() {
    if (this.form.valid) {
      const result = {
        ...this.form.value,
        tags: this.tags()
      };
      this.dialogRef.close(result);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
