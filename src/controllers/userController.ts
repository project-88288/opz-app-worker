import { Context } from 'koa';

export class UserController {
  static getAllUsers(ctx: Context) {
    // Retrieve and return all users
    const users = ['User 1', 'User 2', 'User 3'];
    ctx.body = users;
  }

  static createUser(ctx: Context) {
    // Create a new user
  //  const { name } = ctx.request.body;
    // TODO: Add logic to create a user
    ctx.body = `User ${name} created`;
  }
}
