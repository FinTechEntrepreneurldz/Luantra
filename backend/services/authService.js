const { Storage } = require('@google-cloud/storage');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class AuthService {
  constructor() {
    this.storage = new Storage({
      projectId: 'luantra-platform',
      keyFilename: './service-account-key.json'
    });
    this.bucket = this.storage.bucket('luantra-platform-models');
    this.usersFile = 'users/users-database.json';
  }

  async registerUser(email, password, firstName, lastName) {
    try {
      console.log('Registering new user:', email);
      
      const users = await this.getUsersDatabase();
      
      if (users.find(user => user.email === email)) {
        throw new Error('User already exists with this email');
      }
      
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const newUser = {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        subscription: 'free',
        models: [],
        datasets: []
      };
      
      users.push(newUser);
      await this.saveUsersDatabase(users);
      
      const { passwordHash, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      console.log('Login attempt for:', email);
      
      const users = await this.getUsersDatabase();
      const user = users.find(u => u.email === email.toLowerCase());
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }
      
      user.lastLogin = new Date().toISOString();
      await this.saveUsersDatabase(users);
      
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUsersDatabase() {
    try {
      const file = this.bucket.file(this.usersFile);
      const [exists] = await file.exists();
      
      if (exists) {
        const [contents] = await file.download();
        return JSON.parse(contents.toString());
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error reading users database:', error);
      return [];
    }
  }

  async saveUsersDatabase(users) {
    try {
      const file = this.bucket.file(this.usersFile);
      await file.save(JSON.stringify(users, null, 2), {
        metadata: {
          contentType: 'application/json'
        }
      });
    } catch (error) {
      console.error('Error saving users database:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const users = await this.getUsersDatabase();
      const user = users.find(u => u.id === userId);
      
      if (user) {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
