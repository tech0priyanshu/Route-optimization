from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

@app.after_request
def add_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def a_star(start, end, neighbors):
    open_set = []
    open_set.append((0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: haversine(start[0], start[1], end[0], end[1])}

    while open_set:
        current = min(open_set, key=lambda x: x[0])[1]
        open_set = [item for item in open_set if item[1] != current]

        if current == end:
            return reconstruct_path(came_from, current)

        for neighbor in neighbors(current):
            tentative_g_score = g_score[current] + haversine(current[0], current[1], neighbor[0], neighbor[1])

            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = g_score[neighbor] + haversine(neighbor[0], neighbor[1], end[0], end[1])
                open_set.append((f_score[neighbor], neighbor))

    return []

def reconstruct_path(came_from, current):
    total_path = [current]
    while current in came_from:
        current = came_from[current]
        total_path.append(current)
    return total_path[::-1]

@app.route('/route', methods=['POST'])
def get_route():
    data = request.json
    from_location = (data['from']['lat'], data['from']['lng'])
    to_location = (data['to']['lat'], data['to']['lng'])

    def neighbors(current):
        return [to_location]

    route = a_star(from_location, to_location, neighbors)
    
    route_data = [{"lat": point[0], "lng": point[1]} for point in route]
    return jsonify({"status": "OK", "route": route_data})

if __name__ == '__main__':
    app.run(debug=True)
