import { Controller } from '@nestjs/common';

// This controller stub exists so NestJS's module system stays happy.
// The actual HTTP routes (GET, POST, PUT, DELETE /notes) are registered
// as plain Express routes in main.js using app.get(NotesService) from DI.
// This is the cleanest workaround for the Babel parameter-decorator limitation.
@Controller()
export class NotesController {}
