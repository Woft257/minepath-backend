import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
  ];

  create(createUserDto: any) {
    // In a real app, you'd save to a database
    console.log('Creating user:', createUserDto);
    const newUser = { id: Date.now(), ...createUserDto };
    this.users.push(newUser);
    return newUser;
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(user => user.id === id);
  }

  update(id: number, updateUserDto: any) {
    // In a real app, you'd update in a database
    console.log(`Updating user ${id} with:`, updateUserDto);
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex > -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
      return this.users[userIndex];
    }
    return null;
  }

  remove(id: number) {
    // In a real app, you'd delete from a database
    console.log(`Deleting user ${id}`);
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex > -1) {
      return this.users.splice(userIndex, 1);
    }
    return null;
  }
}

