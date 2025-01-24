import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users',
 {
  id:  integer("id").primaryKey({autoIncrement: true}),
  username: text("username", {length: 20}).notNull(),
  password: text("password").notNull()
 })

export const songHistoryTable = sqliteTable( 'songHistory',
  {
    userId: integer("user_id").notNull().references(() => usersTable.id),
    songId: integer("song_id").notNull().references(() => songsTable.id),
    lastListen: text("last_listen").notNull(),
  }
 )

export const playlistTable = sqliteTable('playlistTable' , 
  {
    id: integer("id").primaryKey({autoIncrement: true}),
    userId: integer("user_id").notNull().references(() => usersTable.id),
    name: text("name", {length: 30}).notNull(),
    isPrivate: integer("is_private").notNull().default(0) // defaults to public
  }
 )

export const songsInPlaylistTable = sqliteTable("songsInPlaylistTable",
  {
    playlistId: integer("playlist_id").notNull().references(() => playlistTable.id),
    songId: integer("song_id").notNull().references(() => songsTable.id)
  }
)
 
export const songsTable = sqliteTable("songsTable",
  {
    id:  integer("id").primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    duration: integer('duration'), // Duration in seconds
    filePath: text('file_path').notNull()
  }
)