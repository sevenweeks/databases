INSERT INTO movies (movie_id,title) VALUES (1,'A Hard Day''s Night'),
	(2,'A Streetcar Named Desire'), (3,'A Touch of Zen'), (4,'Aladdin'),
	(5,'Armageddon'), (6,'Avatar'), (7,'Barry Lyndon');

INSERT INTO actors (actor_id,name) VALUES (1,'John Lennon'),
	(2,'Paul McCartney'), (3,'Ringo Starr'), (4,'Marlon Brando'),
	(5,'Vivien Leigh'), (6,'Kim Hunter'), (7,'Hsu Feng'), (8,'Pai Ying'),
	(9,'Roy Chaio'), (10,'Robin Williams'), (11,'Scott Weinger'),
	(12,'Bruce Willis'), (13,'Ben Affleck'), (14,'Steve Buscemi'),
	(15,'Sam Worthington'), (16,'Sigourney Weaver'), (17,'Zoe Saldana'),
	(18,'Ryan O''Neal'), (19,'Marisa Berenson'), (20,'Leon Vitali');

INSERT INTO movies_actors VALUES (1,1), (1,2), (1,3), (2,4), (2,5),
	(2,6), (3,7), (3,8), (3,9), (4,10), (4,11), (5,12), (5,13), (5,14),
	(6,15), (6,16), (6,17), (7,18), (7,19), (7,20);


SELECT *, cube_distance(genre, '(0,7,0,0,0,0,0,0,0,7,0,0,0,0,7,0,0,0)') dist
FROM movies
WHERE cube_enlarge('(0,7,0,0,0,0,0,0,0,7,0,0,0,0,7,0,0,0)'::cube, 5, 18) @> genre
ORDER BY dist
LIMIT 10;


-- 'Krull'
SELECT m.*, cube_distance(m.genre, s.genre) dist
FROM movies m, (SELECT genre FROM movies WHERE title = 'Star Wars') s
WHERE cube_enlarge(s.genre, 5, 18) @> m.genre
ORDER BY dist
LIMIT 10;

SELECT m.*, cube_distance(m.genre, s.genre) dist
FROM movies m LEFT JOIN movies s ON s.title = 'Star Wars'
WHERE cube_enlarge(s.genre, 5, 18) @> m.genre
ORDER BY dist
LIMIT 10;

-- We use the same concept of a subselecting by a movie title to query by genre name.
-- since we stored the names of each genre with its coordinate position in the vector, 
SELECT g.name, cube_ur_coord(x.genre, g.position) as score
FROM genres g, (SELECT genre FROM movies WHERE title = 'Star Wars') x
WHERE cube_ur_coord(x.genre, g.position) > 0;
