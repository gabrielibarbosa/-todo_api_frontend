import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Column } from '../../core/interfaces/column.interface';
@Component({
  selector: 'app-column-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './column-form.html'
})
export class ColumnForm {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ColumnForm>);
  public data = inject<{ column?: Column }>(MAT_DIALOG_DATA);

  public form: FormGroup = this.fb.group({
    name: [this.data?.column?.name ?? '', [Validators.required, Validators.minLength(3)]],
    position: [this.data?.column?.position ?? 0, [Validators.required, Validators.min(0)]]
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
