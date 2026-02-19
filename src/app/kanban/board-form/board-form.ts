import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Board } from '../../core/interfaces/board.interface';
@Component({
  selector: 'app-board-form',
 standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './board-form.html'
})
export class BoardForm {
private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BoardForm>);
  public data = inject<{ board?: Board }>(MAT_DIALOG_DATA);

  public form: FormGroup = this.fb.group({
    name: [this.data?.board?.name ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
  });

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
