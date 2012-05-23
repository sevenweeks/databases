CREATE TYPE point_type AS (
	name text,
	vector cube,
	distance numeric
);

CREATE OR REPLACE
	FUNCTION find_closest_vector(vector1 cube, maxsize int)
	RETURNS SETOF point_type AS $$
DECLARE
	enlarge INT DEFAULT 1;
	v_point point_type;
BEGIN
	WHILE enlarge <= maxsize LOOP
		RAISE NOTICE 'enlarge hypercube by %', enlarge;
		SELECT name, vector, cube_distance(vector, vector1::cube) dist
			INTO v_point
			FROM genres
			WHERE cube_enlarge(vector1::cube, enlarge, 18) @> vector
			ORDER BY dist
			LIMIT 1;
		IF v_point.dist IS NOT NULL THEN
			EXIT;
		END IF;
		enlarge := enlarge + 1;
	END LOOP;
	
	RETURN NEXT v_point;
END
$$ LANGUAGE 'plpgsql';

-- You can set a max timeout in milliseconds
-- in your environment to stop runaway queries
-- SET statement_timeout TO 10000;
