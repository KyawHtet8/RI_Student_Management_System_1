package com.rockstar.ri.repository;

import com.rockstar.ri.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Course> findByCodeIgnoreCase(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Course c where c.id = :id")
    Optional<Course> findByIdForUpdate(@Param("id") String id);

    @Query("select c from Course c where lower(c.name) like lower(concat('%', :query, '%')) " +
            "or lower(c.code) like lower(concat('%', :query, '%')) order by c.code")
    List<Course> searchByNameOrCode(@Param("query") String query);
}
