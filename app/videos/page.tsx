"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LocalVideoPlayer from "@/components/LocalVideoPlayer";

interface LocalVideo {
  id: string;
  name: string;
  file: File;
  size: number;
  modified: number;
}

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".ogg",
  ".ogv",
  ".avi",
  ".mkv",
];

const DB_NAME = "hdofoot-local-videos";
const DB_STORE = "settings";
const DIRECTORY_KEY = "videos-directory";

function isVideoFile(file: File) {
  const name = file.name.toLowerCase();

  if (
    file.type.startsWith("video/")
  ) {
    return true;
  }

  return VIDEO_EXTENSIONS.some(
    (extension) =>
      name.endsWith(extension)
  );
}

function createVideoId(
  file: File,
  index: number
) {
  return [
    file.name,
    file.size,
    file.lastModified,
    index,
  ].join("-");
}

/* ---------------------------------------------------------- */
/* INDEXED DB */
/* ---------------------------------------------------------- */

function openDatabase(): Promise<IDBDatabase> {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DB_NAME,
          1
        );

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          if (
            !db.objectStoreNames.contains(
              DB_STORE
            )
          ) {
            db.createObjectStore(
              DB_STORE
            );
          }
        };

      request.onsuccess =
        () => {
          resolve(
            request.result
          );
        };

      request.onerror =
        () => {
          reject(
            request.error
          );
        };
    }
  );
}

async function saveDirectoryHandle(
  handle: any
) {
  try {
    const db =
      await openDatabase();

    return new Promise<void>(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            DB_STORE,
            "readwrite"
          );

        transaction.objectStore(
          DB_STORE
        ).put(
          handle,
          DIRECTORY_KEY
        );

        transaction.oncomplete =
          () => {
            db.close();
            resolve();
          };

        transaction.onerror =
          () => {
            db.close();
            reject(
              transaction.error
            );
          };
      }
    );
  } catch {
    // Persistent storage is optional.
  }
}

async function getDirectoryHandle() {
  try {
    const db =
      await openDatabase();

    return new Promise<any>(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            DB_STORE,
            "readonly"
          );

        const request =
          transaction
            .objectStore(
              DB_STORE
            )
            .get(
              DIRECTORY_KEY
            );

        request.onsuccess =
          () => {
            db.close();
            resolve(
              request.result ||
                null
            );
          };

        request.onerror =
          () => {
            db.close();
            reject(
              request.error
            );
          };
      }
    );
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------- */
/* READ DIRECTORY */
/* ---------------------------------------------------------- */

async function readDirectory(
  directoryHandle: any
): Promise<File[]> {
  const files: File[] = [];

  async function walk(
    handle: any
  ) {
    for await (
      const entry of handle.values()
    ) {
      if (
        entry.kind === "file"
      ) {
        try {
          const file =
            await entry.getFile();

          if (
            isVideoFile(file)
          ) {
            files.push(file);
          }
        } catch {
          // Ignore inaccessible files.
        }
      }

      /*
       * Include subfolders too.
       */
      if (
        entry.kind ===
        "directory"
      ) {
        try {
          await walk(entry);
        } catch {
          // Ignore inaccessible folders.
        }
      }
    }
  }

  await walk(
    directoryHandle
  );

  return files;
}

/* ---------------------------------------------------------- */
/* MAIN PAGE */
/* ---------------------------------------------------------- */

export default function VideosPage() {
  const [videos, setVideos] =
    useState<LocalVideo[]>([]);

  const [selectedVideo, setSelectedVideo] =
    useState<LocalVideo | null>(
      null
    );

  const [directoryHandle, setDirectoryHandle] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [initializing, setInitializing] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    permissionGranted,
    setPermissionGranted,
  ] = useState(false);

  /* -------------------------------------------------------- */
  /* LOAD VIDEOS */
  /* -------------------------------------------------------- */

  const loadVideos = useCallback(
    async (
      handle: any
    ) => {
      if (!handle) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const permission =
          await handle.queryPermission({
            mode: "read",
          });

        if (
          permission !==
          "granted"
        ) {
          setPermissionGranted(
            false
          );

          setVideos([]);

          return;
        }

        setPermissionGranted(
          true
        );

        const files =
          await readDirectory(
            handle
          );

        const localVideos =
          files
            .sort(
              (
                a,
                b
              ) =>
                b.lastModified -
                a.lastModified
            )
            .map(
              (
                file,
                index
              ) => ({
                id:
                  createVideoId(
                    file,
                    index
                  ),
                name:
                  file.name,
                file,
                size:
                  file.size,
                modified:
                  file.lastModified,
              })
            );

        setVideos(
          localVideos
        );

      } catch (err) {
        console.error(
          "Unable to read video folder:",
          err
        );

        setError(
          "Unable to read your video folder."
        );

      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* -------------------------------------------------------- */
  /* RESTORE SAVED FOLDER */
  /* -------------------------------------------------------- */

  useEffect(() => {
    let cancelled =
      false;

    async function restore() {
      try {
        if (
          !("showDirectoryPicker" in window)
        ) {
          return;
        }

        const handle =
          await getDirectoryHandle();

        if (
          !handle ||
          cancelled
        ) {
          return;
        }

        setDirectoryHandle(
          handle
        );

        await loadVideos(
          handle
        );

      } catch (err) {
        console.warn(
          "Saved video folder could not be restored:",
          err
        );
      } finally {
        if (!cancelled) {
          setInitializing(
            false
          );
        }
      }
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, [loadVideos]);

  /* -------------------------------------------------------- */
  /* CHOOSE VIDEO FOLDER */
  /* -------------------------------------------------------- */

  async function chooseVideoFolder() {
    setError("");

    try {
      if (
        !(
          "showDirectoryPicker" in
          window
        )
      ) {
        setError(
          "Your browser does not support folder access. Use the Select Videos button instead."
        );

        return;
      }

      const picker =
        (
          window as any
        ).showDirectoryPicker;

      const handle =
        await picker({
          mode: "read",
        });

      /*
       * Request explicit permission.
       */
      const permission =
        await handle.requestPermission({
          mode: "read",
        });

      if (
        permission !==
        "granted"
      ) {
        setPermissionGranted(
          false
        );

        setError(
          "HDOFOOT needs permission to read your video folder."
        );

        return;
      }

      setDirectoryHandle(
        handle
      );

      setPermissionGranted(
        true
      );

      await saveDirectoryHandle(
        handle
      );

      await loadVideos(
        handle
      );

    } catch (err) {
      console.error(
        "Video folder selection failed:",
        err
      );

      if (
        err instanceof Error &&
        err.name ===
          "AbortError"
      ) {
        return;
      }

      setError(
        "Unable to access your video folder."
      );
    }
  }

  /* -------------------------------------------------------- */
  /* FALLBACK FILE PICKER */
/* -------------------------------------------------------- */

  function selectVideoFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      event.target.files;

    if (!files) {
      return;
    }

    const localVideos =
      Array.from(files)
        .filter(
          isVideoFile
        )
        .map(
          (
            file,
            index
          ) => ({
            id:
              createVideoId(
                file,
                index
              ),
            name:
              file.name,
            file,
            size:
              file.size,
            modified:
              file.lastModified,
          })
        );

    setVideos(
      localVideos
    );

    setPermissionGranted(
      true
    );

    setError("");
  }

  /* -------------------------------------------------------- */
  /* FORMAT SIZE */
/* -------------------------------------------------------- */

  const totalSize =
    useMemo(() => {
      const bytes =
        videos.reduce(
          (
            total,
            video
          ) =>
            total +
            video.size,
          0
        );

      if (
        bytes <
        1024 * 1024
      ) {
        return `${(
          bytes / 1024
        ).toFixed(1)} KB`;
      }

      if (
        bytes <
        1024 * 1024 * 1024
      ) {
        return `${(
          bytes /
          (1024 * 1024)
        ).toFixed(1)} GB`;
      }

      return `${(
        bytes /
        (1024 *
          1024 *
          1024)
      ).toFixed(2)} GB`;
    }, [videos]);

  /* -------------------------------------------------------- */
  /* INITIAL LOADING */
/* -------------------------------------------------------- */

  if (initializing) {
    return (
      <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-10 text-center">
            <p className="text-sm text-gray-400">
              Loading your videos...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------- */
  /* PAGE */
/* -------------------------------------------------------- */

  return (
    <main className="min-h-screen w-full bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-5 md:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            My Videos
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Watch videos stored on your phone directly in HDOFOOT.
            Your videos stay on your device.
          </p>
        </header>

        {/* PERMISSION CARD */}
        {!permissionGranted &&
          videos.length === 0 && (
            <section className="mb-8 rounded-2xl border border-green-500/20 bg-[#0d1118] p-6 sm:p-8">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-6 w-6"
                      >
                        <path d="M3 7h6l2 2h10v10H3z" />
                        <path d="M3 7V5h6l2 2" />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Give HDOFOOT video access
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Select your Videos folder to load your videos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={
                      chooseVideoFolder
                    }
                    className="
                      tv-focus
                      tv-nav-item
                      inline-flex
                      min-h-[48px]
                      items-center
                      justify-center
                      rounded-xl
                      bg-green-500
                      px-6
                      font-bold
                      text-black
                      transition
                      hover:bg-green-400
                    "
                  >
                    Allow Video Access
                  </button>

                  <label
                    className="
                      tv-focus
                      tv-nav-item
                      inline-flex
                      min-h-[48px]
                      cursor-pointer
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/10
                      bg-[#121821]
                      px-6
                      font-semibold
                      text-white
                      transition
                      hover:border-green-500/30
                    "
                  >
                    Select Videos

                    <input
                      type="file"
                      accept="video/*,.mkv,.avi,.mov,.m4v,.mp4,.webm"
                      multiple
                      className="hidden"
                      onChange={
                        selectVideoFiles
                      }
                    />
                  </label>

                </div>
              </div>
            </section>
          )}

        {/* ERROR */}
        {error && (
          <section className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="font-semibold text-red-400">
              {error}
            </p>
          </section>
        )}

        {/* LOADING */}
        {loading && (
          <section className="mb-6 rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-500/20 border-t-green-400" />

            <p className="mt-4 text-sm text-gray-500">
              Loading your videos...
            </p>
          </section>
        )}

        {/* LIBRARY HEADER */}
        {!loading &&
          videos.length > 0 && (
            <section className="mb-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <h2 className="text-2xl font-black">
                    Video Library
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {videos.length}{" "}
                    {videos.length === 1
                      ? "video"
                      : "videos"}
                    {" • "}
                    {totalSize}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">

                  {directoryHandle && (
                    <button
                      type="button"
                      onClick={
                        chooseVideoFolder
                      }
                      className="
                        tv-focus
                        tv-nav-item
                        min-h-[44px]
                        rounded-xl
                        border
                        border-white/10
                        bg-[#0d1118]
                        px-4
                        text-sm
                        font-semibold
                        text-gray-300
                      "
                    >
                      Change Folder
                    </button>
                  )}

                  <label
                    className="
                      tv-focus
                      tv-nav-item
                      inline-flex
                      min-h-[44px]
                      cursor-pointer
                      items-center
                      rounded-xl
                      bg-green-500
                      px-4
                      text-sm
                      font-bold
                      text-black
                    "
                  >
                    Add Videos

                    <input
                      type="file"
                      accept="video/*,.mkv,.avi,.mov,.m4v,.mp4,.webm"
                      multiple
                      className="hidden"
                      onChange={
                        selectVideoFiles
                      }
                    />
                  </label>

                </div>
              </div>
            </section>
          )}

        {/* EMPTY */}
        {!loading &&
          videos.length === 0 &&
          permissionGranted && (
            <section className="rounded-2xl border border-white/10 bg-[#0d1118] p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7 text-green-400"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="m10 9 5 3-5 3z" />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-bold">
                No videos found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                No supported video files were found in the selected folder.
              </p>

              <button
                type="button"
                onClick={
                  chooseVideoFolder
                }
                className="
                  tv-focus
                  tv-nav-item
                  mt-6
                  min-h-[48px]
                  rounded-xl
                  bg-green-500
                  px-6
                  font-bold
                  text-black
                "
              >
                Choose Another Folder
              </button>
            </section>
          )}

        {/* VIDEO PLAYER */}
        {selectedVideo && (
          <section className="mb-8">
            <LocalVideoPlayer
              file={
                selectedVideo.file
              }
              title={
                selectedVideo.name
              }
              onClose={() =>
                setSelectedVideo(
                  null
                )
              }
            />
          </section>
        )}

        {/* VIDEO GRID */}
        {!loading &&
          videos.length > 0 && (
            <section
              className="
                grid
                w-full
                grid-cols-2
                gap-4
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                xl:grid-cols-6
                2xl:grid-cols-7
              "
            >
              {videos.map(
                (video) => (
                  <button
                    type="button"
                    key={
                      video.id
                    }
                    onClick={() =>
                      setSelectedVideo(
                        video
                      )
                    }
                    className="
                      tv-focus
                      tv-nav-item
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-[#0d1118]
                      text-left
                      transition
                      hover:border-green-500/30
                      hover:bg-[#10161f]
                    "
                  >

                    {/* VIDEO PREVIEW */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#080b10]">

                      <div className="absolute inset-0 flex items-center justify-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 transition group-hover:scale-110 group-hover:bg-green-500/20">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="ml-1 h-7 w-7 text-green-400"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>

                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

                    </div>

                    {/* INFO */}
                    <div className="p-3">

                      <h3 className="truncate text-sm font-bold text-white">
                        {
                          video.name
                        }
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {(
                          video.size /
                          (1024 *
                            1024)
                        ).toFixed(
                          1
                        )}{" "}
                        MB
                      </p>

                    </div>

                  </button>
                )
              )}
            </section>
          )}

      </div>
    </main>
  );
}
