import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const run = async () => {
  await connectDB();
  console.log('Seeding CherryReddit demo data...');

  await Promise.all([
    User.deleteMany({}),
    Community.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  const admin = await User.create({
    username: 'cherry_admin',
    email: 'admin@cherryreddit.dev',
    password: 'password123',
    role: 'admin',
    bio: 'Keeping the orchard tidy 🍒',
  });

  const alice = await User.create({
    username: 'alice_bakes',
    email: 'alice@cherryreddit.dev',
    password: 'password123',
    bio: 'Pastry chef & pixel artist.',
  });

  const bob = await User.create({
    username: 'bob_codes',
    email: 'bob@cherryreddit.dev',
    password: 'password123',
    bio: 'Full-stack tinkerer.',
  });

  const community = await Community.create({
    name: 'confectionery',
    displayName: 'Confectionery',
    description: 'A sweet little corner for dessert lovers, bakers, and candy artists.',
    themeColor: '#D73A49',
    creator: admin._id,
    moderators: [admin._id],
    members: [admin._id, alice._id, bob._id],
    memberCount: 3,
    rules: [
      { title: 'Be kind', body: 'No harassment or personal attacks.' },
      { title: 'Stay on topic', body: 'Keep posts related to sweets and desserts.' },
    ],
  });

  const community2 = await Community.create({
    name: 'webdev',
    displayName: 'Web Development',
    description: 'Everything about building for the web.',
    themeColor: '#6F1D2A',
    creator: bob._id,
    moderators: [bob._id],
    members: [bob._id, alice._id],
    memberCount: 2,
  });

  await User.updateMany(
    { _id: { $in: [admin._id, alice._id, bob._id] } },
    { $addToSet: { joinedCommunities: community._id } }
  );

  const post1 = await Post.create({
    title: 'My first attempt at cherry macarons 🍒',
    body: 'Took three tries but finally got the feet right! Recipe in comments.',
    type: 'text',
    author: alice._id,
    community: community._id,
    upvotes: [alice._id, bob._id, admin._id],
    score: 3,
  });
  post1.computeHotRank();
  await post1.save();

  const post2 = await Post.create({
    title: 'Built a scrapbook-style CSS scallop divider — here is how',
    body: 'Used a repeating radial-gradient mask to fake the scalloped edge without SVG.',
    type: 'text',
    author: bob._id,
    community: community2._id,
    upvotes: [bob._id],
    score: 1,
  });
  post2.computeHotRank();
  await post2.save();

  const c1 = await Comment.create({
    body: 'This looks amazing! Please share the recipe 🙏',
    author: bob._id,
    post: post1._id,
    upvotes: [alice._id],
    score: 1,
  });
  post1.commentCount += 1;
  await post1.save();

  await Comment.create({
    body: 'Seconding this, need the recipe ASAP.',
    author: admin._id,
    post: post1._id,
    parent: c1._id,
    path: `${c1._id},`,
    depth: 1,
    score: 0,
  });
  c1.replyCount = 1;
  await c1.save();
  post1.commentCount += 1;
  await post1.save();

  console.log('Seed complete:');
  console.log(' - Admin login: admin@cherryreddit.dev / password123');
  console.log(' - User login: alice@cherryreddit.dev / password123');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
