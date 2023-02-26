package com.maxprofit.calculator;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("checkstyle:LineLength")
class Helper {

  final List<List<Integer>> getAllPermutationsForListOfSize(final int sizeOfList) {
    final ArrayList<List<Integer>> perm = new ArrayList<>();
    final ArrayList<Integer> temp = new ArrayList<>();
    final ArrayList<Integer> allValues = new ArrayList<>();
    final ArrayList<Integer> single = new ArrayList<>();
    int current;

    for (int i = 0; i < sizeOfList; i++) {
      temp.clear();

      // creating a combination of all integers to add in the end
      allValues.add(i);

      // adding the permutation of the single integer
      single.add(i);

      perm.add(new ArrayList<>(single));
      single.clear();

      //looping and excluding each integer to create the rest of the combinations
      for (int j = 0; j <= sizeOfList - 1; j++) {
        if (j != i) {
          temp.add(j);
          current = 0;

          while (current != sizeOfList) {
            if (
              j <= sizeOfList - 1
                      && temp.size() > 1
                      && !perm.contains(
                new ArrayList<>(
                  temp.stream().sorted().collect(Collectors.toList())
                )
              )
            ) {
              perm.add(
                new ArrayList<>(
                  temp.stream().sorted().collect(Collectors.toList())
                )
              );
              temp.remove(temp.size() - 1);
            }
            current++;
          }
        }
      }

      temp.clear();

      for (int k = sizeOfList - 1; k >= 0; k--) {
        if (k != i) {
          temp.add(k);
        }

        if (
          temp.size() > 1
            && !perm.contains(temp.stream().sorted().collect(Collectors.toList()))
        ) {
          perm.add(
            new ArrayList<>(temp.stream().sorted().collect(Collectors.toList()))
          );
        }
      }
    }

    //  adding the combination containing all integers
    if (!perm.contains(new ArrayList<>(allValues)))
    {
      perm.add(new ArrayList<>(allValues));
    }

    return perm;
  }
}
