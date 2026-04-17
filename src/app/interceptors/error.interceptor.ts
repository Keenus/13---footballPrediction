import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

const SILENT_URLS = ['/auth/me'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (SILENT_URLS.some(u => req.url.includes(u))) {
        return throwError(() => err);
      }

      const message = err.error?.error
        || err.error?.message
        || fallbackMessage(err.status);

      toast.error(message);

      return throwError(() => err);
    })
  );
};

function fallbackMessage(status: number): string {
  switch (status) {
    case 0:   return 'Brak połączenia z serwerem';
    case 400: return 'Nieprawidłowe żądanie';
    case 401: return 'Sesja wygasła — zaloguj się ponownie';
    case 403: return 'Brak uprawnień';
    case 404: return 'Nie znaleziono zasobu';
    case 409: return 'Konflikt danych';
    case 422: return 'Nieprawidłowe dane';
    case 429: return 'Zbyt wiele żądań — spróbuj później';
    case 500: return 'Błąd serwera — spróbuj ponownie';
    default:  return `Wystąpił błąd (${status})`;
  }
}
