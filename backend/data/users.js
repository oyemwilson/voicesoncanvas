import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User',
    email: 'admin@email.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
    isEmailVerified: true,
    isSeller: false,
    sellerApproved: false,
    isFeaturedArtist: false,
    avatar: '/images/admin-avatar.jpg',
    artistProfile: {
      bio: 'A passionate painter specializing in Afro‑Futurism themes.',
      artistStatement: 'My works explore the intersection of tradition and modernity.',
      location: 'Lagos, Nigeria',
      availableWorks: [] // will be filled after product seeding
    }
  },
  {
    name: 'John Doe',
    email: 'john@email.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    isEmailVerified: true,
    isSeller: true,          // ✅ this user applied as seller
    sellerApproved: true,    // ✅ admin approved
    isFeaturedArtist: true,  // ✅ marked as a featured artist
    avatar: '/images/john-avatar.jpg',
    artistProfile: {
      bio: 'A passionate painter specializing in Afro‑Futurism themes.',
      artistStatement: 'My works explore the intersection of tradition and modernity.',
      location: 'New York, USA',
      availableWorks: []
    }
  },
  {
    name: 'Jane Doe',
    email: 'jane@email.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    isEmailVerified: true,
    isSeller: true,
    sellerApproved: true,   // ✅ applied but not yet approved
    isFeaturedArtist: false,
    avatar: '/images/jane-avatar.jpg',
    artistProfile: {
      bio: 'Mixed‑media artist exploring abstract concepts.',
      artistStatement: 'Art is freedom; my works are journeys into emotion.',
      location: 'Paris, France',
      availableWorks: []
    }
  },
  {
    name: 'Janet Doe',
    email: 'janet@email.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    isEmailVerified: true,
    isSeller: false,
    sellerApproved: false,
    isFeaturedArtist: false,
    avatar: '/images/janet-avatar.jpg',
    artistProfile: {
      bio: 'Test Mixed‑media artist exploring abstract concepts.',
      artistStatement: 'Test Art is freedom; my works are journeys into emotion.',
      location: 'Berlin, Germany',
      availableWorks: []
    }
  }
];

export default users;
