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
    avatar: '/images/admin.webp',
    artistProfile: {
      bio: `With over a decade of experience championing emerging talents,
      Admin User is a passionate curator and visionary leader in the digital art space.
      Their expertise spans exhibition curation, gallery partnerships, and community-driven art initiatives,
      fostering growth for artists worldwide.`,
      artistStatement: `I believe art is a bridge between cultures and ideas.
      Through thoughtful curation and strategic collaborations,
      I aim to elevate voices that challenge conventions and spark meaningful dialogue.
      My goal is to build platforms where creativity thrives sustainably.`,
      location: 'Lagos, Nigeria',
      availableWorks: []
    }
  },

  {
    name: 'John Doe',
    email: 'john@email.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    isEmailVerified: true,
    isSeller: true,
    sellerApproved: true,
    isFeaturedArtist: true,
    avatar: '/images/artist.webp',
    artistProfile: {
      bio: `John Doe is a New York–based multidisciplinary artist whose work explores
      the complex relationship between urban life and personal identity.
      Trained in both fine arts and digital media, John combines traditional painting
      techniques with AR-enhanced installations to immerse viewers in the
      textures and rhythms of the cityscape.`,
      artistStatement: `My practice is rooted in the idea that our environments shape us.
      By layering brushstrokes with interactive digital elements,
      I invite the audience to navigate their own narratives within shared spaces.
      Each piece is a conversation about memory, movement, and meaning.`,
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
    sellerApproved: true,
    isFeaturedArtist: false,
    avatar: '/images/artist2.jpg',
    artistProfile: {
      bio: `Jane Doe is a Paris-based mixed-media artist who melds classical
      painting traditions with experimental materials. Her pieces often
      incorporate recycled textiles, hand-dyed pigments, and sculptural
      elements to evoke themes of memory, transformation, and cultural archive.`,
      artistStatement: `Art is freedom—a portal to the subconscious.
      Through layered surfaces and tactile contrasts,
      I explore the tension between permanence and flux.
      Each work is an invitation to witness beauty in unexpected forms.`,
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
    avatar: '/images/artist3.jpg',
    artistProfile: {
      bio: `Janet Doe is a Berlin-based installation artist whose work navigates
      themes of identity, displacement, and memory. With a background in architecture and performance,
      she constructs immersive environments that challenge perceptions of
      space, presence, and belonging.`,
      artistStatement: `I create spaces that encourage introspection and communal exchange.
      By layering sound, light, and physical structures,
      I seek to dissolve boundaries between observer and participant,
      forging moments of shared reflection.`,
      location: 'Berlin, Germany',
      availableWorks: []
    }
  }
];

export default users;
