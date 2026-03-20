"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Grid3X3, List, Plus, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SortablePost } from "@/components/profiles/sortable-post";
import { FeedView } from "@/components/profiles/feed-view";
import { AddPostDialog } from "@/components/profiles/add-post-dialog";
import { PostDetailDialog } from "@/components/profiles/post-detail-dialog";
import { createClient } from "@/lib/supabase/client";

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  grid_position: number;
  status: "draft" | "scheduled" | "published";
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function PostsGrid({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = posts.findIndex((p) => p.id === active.id);
        const newIndex = posts.findIndex((p) => p.id === over.id);

        const newPosts = arrayMove(posts, oldIndex, newIndex);
        setPosts(newPosts);

        // Update grid positions in database
        const supabase = createClient();
        const updates = newPosts.map((post, index) => ({
          id: post.id,
          user_id: post.user_id,
          image_url: post.image_url,
          grid_position: index,
        }));

        await supabase.from("posts").upsert(updates);
      }
    },
    [posts]
  );

  const handleAddPost = (newPost: Post) => {
    setPosts((prev) => [...prev, newPost]);
    setShowAddDialog(false);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    setSelectedPost(null);
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  return (
    <>
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-between border-t pt-3">
          <TabsList className="h-9 bg-transparent p-0">
            <TabsTrigger
              value="grid"
              className="gap-1.5 rounded-none border-t-2 border-transparent px-4 py-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger
              value="feed"
              className="gap-1.5 rounded-none border-t-2 border-transparent px-4 py-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Post
          </Button>
        </div>

        <TabsContent value="grid" className="mt-4">
          {posts.length === 0 ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={posts} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 gap-1">
                  {posts.map((post) => (
                    <SortablePost
                      key={post.id}
                      post={post}
                      onClick={() => setSelectedPost(post)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="feed" className="mt-4">
          {posts.length === 0 ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <FeedView posts={posts} onPostClick={setSelectedPost} />
          )}
        </TabsContent>
      </Tabs>

      <AddPostDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPost}
        nextPosition={posts.length}
      />

      <PostDetailDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={handleUpdatePost}
        onDelete={handleDeletePost}
      />
    </>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold">No posts yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Start building your grid by adding your first post
      </p>
      <Button className="mt-4" onClick={onAdd}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Your First Post
      </Button>
    </div>
  );
}
