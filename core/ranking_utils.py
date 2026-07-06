import json


def assign_ranks(rows, key):
    """공동 순위 부여 (1,1,3,4... 방식).

    `rows`는 이미 key 기준 내림차순 정렬되어 있어야 합니다.
    `key`는 row dict의 키 문자열 또는 row -> 비교 가능한 값을 반환하는 callable 입니다.
    """
    getter = key if callable(key) else (lambda row, k=key: row[k])
    for i, row in enumerate(rows):
        if i == 0 or getter(row) != getter(rows[i - 1]):
            row["rank"] = i + 1
        else:
            row["rank"] = rows[i - 1]["rank"]
    return rows


def group_top_ranks(rows, top_n=3):
    """rank가 부여된 rows를 등수별로 그룹핑해 상위 top_n개 그룹을 반환합니다.

    각 그룹은 {"rank": int, "rows": [...], "members_json": str} 형태이며,
    members_json은 포디움 공동순위 표시용(hover 모달) JSON 문자열입니다.
    """
    groups = []
    group_index_by_rank = {}
    for row in rows:
        rank = row["rank"]
        if rank not in group_index_by_rank:
            if len(groups) >= top_n:
                break
            group_index_by_rank[rank] = len(groups)
            groups.append({"rank": rank, "rows": [row]})
        else:
            groups[group_index_by_rank[rank]]["rows"].append(row)

    for group in groups:
        group["members_json"] = json.dumps([
            {
                "userId": row["user"].id,
                "picture": row["user"].get_picture(),
                "nickname": row["user"].display_name,
                "fullname": row["user"].get_full_name,
            }
            for row in group["rows"]
        ])

    return groups
