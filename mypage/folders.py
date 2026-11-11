"""개인 탭 폴더 트리: 폴더 안에 폴더를 둘 수 있다 (PersonalFolder.parent). 한 사용자의 폴더는 많지 않아 한 번에 읽어 메모리에서 트리를 만든다."""
from django.db.models import Count, Q

from .models import PersonalFolder

MAX_FOLDER_DEPTH = 5      # 루트 폴더가 1단계. 이보다 깊게는 만들거나 옮길 수 없다


class FolderNode:
    """트리의 한 폴더: 화면에 쓰는 깊이·경로·직접 들어 있는 자료 수·자기와 아래 폴더 id."""

    def __init__(self, folder, doc_count):
        self.folder = folder
        self.pk = folder.pk
        self.name = folder.name
        self.parent_id = folder.parent_id
        self.doc_count = doc_count
        self.depth = 1
        self.path = folder.name
        self.children = []
        self.subtree_ids = {folder.pk}      # 자기 자신 + 모든 하위 폴더

    @property
    def indent(self):
        return self.depth - 1

    @property
    def height(self):
        """이 폴더에서 가장 깊은 하위까지 몇 단계인지 (자기만 있으면 1)."""
        return 1 + max((c.height for c in self.children), default=0)


def build_tree(user):
    """사용자의 폴더 전부를 (노드 목록 깊이 우선 순서, id→노드, 루트 노드 목록)으로 돌려준다. 이름순."""
    rows = list(PersonalFolder.objects.filter(user=user).annotate(
        doc_count=Count("documents", filter=Q(documents__is_deleted=False))).order_by("name", "pk"))
    nodes = {f.pk: FolderNode(f, f.doc_count) for f in rows}
    roots = []
    for node in nodes.values():
        parent = nodes.get(node.parent_id)
        (parent.children if parent else roots).append(node)
    ordered = []

    def walk(node, depth, prefix):
        node.depth = depth
        node.path = f"{prefix} / {node.name}" if prefix else node.name
        ordered.append(node)
        for child in node.children:
            walk(child, depth + 1, node.path)
            node.subtree_ids |= child.subtree_ids

    for root in roots:
        walk(root, 1, "")
    return ordered, nodes, roots


def breadcrumb(nodes, folder):
    """현재 폴더까지의 경로: 루트 쪽 폴더부터 현재 폴더까지."""
    chain, seen = [], set()
    node = nodes.get(folder.pk) if folder else None
    while node is not None and node.pk not in seen:
        seen.add(node.pk)
        chain.append(node)
        node = nodes.get(node.parent_id)
    return list(reversed(chain))


def can_hold_child(nodes, parent_pk, extra_height=1):
    """parent_pk 폴더(None이면 루트) 아래에 높이가 extra_height인 가지를 달아도 MAX_FOLDER_DEPTH를 넘지 않는지."""
    depth = nodes[parent_pk].depth if parent_pk else 0
    return depth + extra_height <= MAX_FOLDER_DEPTH
